/*
 * Copyright (c) 2016-2018. Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * @file   main.c
 *
 * @date   25/jan/2016
 * @author M. Palumbi
 */




/* include includes */
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <string.h>
#include "mqtt_transport.h"
#include "helpers.h"

#include "engine.h"
#include "led.h"
#include "button.h"

#include "aws_iot_config.h"
#include "aws_iot_log.h"
#include "aws_iot_version.h"
#include "aws_iot_mqtt_client_interface.h"

/**
 * @brief Default cert location
 */
static char certDirectory[PATH_MAX + 1] = "./";

#define SYNCOBJECT_INITIALIZER { PTHREAD_MUTEX_INITIALIZER, PTHREAD_COND_INITIALIZER, 0 }
typedef struct {
    pthread_mutex_t mtx;
    pthread_cond_t var;
    unsigned val;
} SyncObject;

//char *mqtt_address = DEFAULT_MQTT_ADDRESS;
//uint32_t mqtt_port = DEFAULT_MQTT_PORT;
int mqtt_proxy_connected = 0;

//mqtt staus variables
static AWS_IoT_Client client = {0};
static char *ClientID = NULL;



static void connlost(AWS_IoT_Client *pClient, void *data);

static char rootCA[PATH_MAX + 1] = {0};
static char clientCRT[PATH_MAX + 1] ={0};
static char clientKey[PATH_MAX + 1] ={0};
static char CurrentWD[PATH_MAX + 1] ={0};

static void mqttConnect(int reconnect)
{
    int rc;

    IoT_Client_Connect_Params connectParams = iotClientConnectParamsDefault;
    IoT_Client_Init_Params mqttInitParams = iotClientInitParamsDefault;

    // Create connection
    if (CLIENT_STATE_INVALID == aws_iot_mqtt_get_client_state(&client)) {

        IOT_INFO("\nAWS IoT SDK Version %d.%d.%d-%s\n", VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH, VERSION_TAG);

        getcwd(CurrentWD, sizeof(CurrentWD));
        snprintf(rootCA, PATH_MAX + 1, "%s/%s/%s", CurrentWD, certDirectory, AWS_IOT_ROOT_CA_FILENAME);

        IOT_DEBUG("rootCA %s", rootCA);
        IOT_DEBUG("clientCRT %s", clientCRT);
        IOT_DEBUG("clientKey %s", clientKey);
        mqttInitParams.enableAutoReconnect = false; // We enable this later below
        mqttInitParams.pHostURL = proxyAddress;//HostAddress;
        mqttInitParams.port = proxyPort;
        mqttInitParams.pRootCALocation = rootCA;
        mqttInitParams.pDeviceCertLocation = clientCRT;
        mqttInitParams.pDevicePrivateKeyLocation = clientKey;
        mqttInitParams.mqttCommandTimeout_ms = 20000;
        mqttInitParams.tlsHandshakeTimeout_ms = 5000;
        mqttInitParams.isSSLHostnameVerify = true;
        mqttInitParams.disconnectHandler = connlost;
        mqttInitParams.disconnectHandlerData = NULL;

        rc = aws_iot_mqtt_init(&client, &mqttInitParams);
        if(SUCCESS != rc) {
            IOT_ERROR("aws_iot_mqtt_init returned error : %d ", rc);
            exit(-1);
        }
        // disable client certificate authentication and enable UniquID authentication
        client.networkStack.tlsConnectParams.pDeviceCertLocation = "";
        client.networkStack.tlsConnectParams.pUniqIDAuth = awsAgentName;

    }
    if (aws_iot_mqtt_is_client_connected(&client)) return ;


    // Try to connect
    connectParams.keepAliveIntervalInSec = 60;
    connectParams.isCleanSession = true;
    connectParams.MQTTVersion = MQTT_3_1_1;
    connectParams.pClientID = ClientID;
    connectParams.clientIDLen = (uint16_t) strlen(ClientID);
    connectParams.isWillMsgPresent = false;
    while ((rc = aws_iot_mqtt_connect(&client, &connectParams)) != SUCCESS) {
        DBG_Print("mqtt Failed to connect, return code %d\n", rc);
        sleep(10);
    }
    mqtt_proxy_connected = 1;
    DBG_Print("aws nmqtt-proxy Connected!!\n");

    if(reconnect) {
        while (MQTT_CLIENT_NOT_IDLE_ERROR == (rc = aws_iot_mqtt_resubscribe(&client))) {
            DBG_Print("resubscribe  %d!!!\n", rc);
            usleep(200000);
        };
        return;
    }

    return ;
}

// send buffers and synchronization variables
#define PROVIDER_BUFFER_HAS_DATA 1
#define USER_BUFFER_HAS_DATA 2
#define CONNECTION_LOST 4
static SyncObject sync_msg = SYNCOBJECT_INITIALIZER;


static void connlost(AWS_IoT_Client *pClient, void *context)
{
    (void)context;
    if(NULL == pClient) {
        return;
    }
    mqtt_proxy_connected = 0;
    DBG_Print("\aws nmqtt-proxy Connection lost\n");
    sleep(10);
    //mqttConnect();
    pthread_mutex_lock(&(sync_msg.mtx));
    sync_msg.val |= CONNECTION_LOST;
    //pthread_cond_signal(&(sync_msg.var));
    pthread_mutex_unlock(&(sync_msg.mtx));
}

static void clear_identity(void)
{
    unlink("identity.db");
    unlink("serial.no");
    unlink("ccache.bin");
    unlink("clicache.bin");
    led_blink();
}


int main(int argc, char **argv) {

    (void) argc; (void) argv;
    IoT_Publish_Message_Params led_status = {.qos = MQTT_QOS, .isRetained = 0};
    int res;

    led_setup();
    button_setup();
    if (button_is_pressed()) clear_identity();

    // create an unique devicename and start the UniquID engine
    static char deviceName[sizeof(AWS_IOT_MQTT_CLIENT_ID) + 6*2 + 1];
    uint8_t *id = getSerial();
    snprintf(deviceName, sizeof(deviceName), "%s%02x%02x%02x%02x%02x%02x",AWS_IOT_MQTT_CLIENT_ID, id[0], id[1], id[2], id[3], id[4], id[5]);
    uniquidEngine(deviceName);

    ClientID = deviceName;
    mqttConnect(0);

    while(1) {
        pthread_mutex_lock(&(sync_msg.mtx));
        if (sync_msg.val & CONNECTION_LOST) {
            // Connection lost
            mqttConnect(1);

            sync_msg.val ^= CONNECTION_LOST;
        }
        // get the LED status
        char led_json[100] = "";
        user_method_led_get("", led_json, sizeof(led_json));
        led_status.payload = led_json;
        led_status.payloadLen = strlen(led_json);
        //publish the LED status
        DBG_Print("publishing %s\n", led_json);
        while (MQTT_CLIENT_NOT_IDLE_ERROR ==
                (res = aws_iot_mqtt_publish(&client, deviceName, strlen(deviceName), &led_status))) {
                    DBG_Print("publish state = %d\n", res);
                    usleep(200000);
                }
        pthread_mutex_unlock(&(sync_msg.mtx));
        res = aws_iot_mqtt_yield(&client, 200);
        if (SUCCESS != res) {
            DBG_Print("aws_iot_mqtt_yield() return %d\n", res);
            usleep(300000);
        }
        sleep(5);
    }
}
