/*
 * Copyright (c) 2018. Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * main.c
 *
 *  Created on: 13/may/2018
 *      Author: M. Palumbi
 */

/*
 * DESCRIPTION
 * Sample implementation of a user function controlling the led on the
 * Digi ConnectCore 6UL SBC Express
 */

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <unistd.h>
#include <pthread.h>

#include "led.h"

#include <libdigiapix/gpio.h>


static gpio_t *gpio_output;
static gpio_value_t led_status = GPIO_LOW;
static pthread_mutex_t led_mtx = PTHREAD_MUTEX_INITIALIZER;

/**
 * Setup the led
 */
void led_setup(void)
{
    int led = ldx_gpio_get_kernel_number("USER_LED");

    /* Request output GPIO */
    gpio_output =
        ldx_gpio_request((unsigned int)led, GPIO_OUTPUT_LOW, REQUEST_SHARED);
    led_status = GPIO_LOW;
    if (!gpio_output) {
        printf("Failed to initialize output GPIO\n");
        return;
    }
}

/**
 * switch on/off or toggle the board user led
 * @param[in] param "on" or "off" "toggle"
 */
void user_method_led_set(char *param, char *result, size_t size)
{
    pthread_mutex_lock(&led_mtx);
    if (strcmp(param, "toggle") == 0) {
        led_status = GPIO_HIGH == led_status ? GPIO_LOW : GPIO_HIGH;
        ldx_gpio_set_value(gpio_output, led_status);
        goto clean;
    }
    if (strcmp(param, "on") == 0) {
        ldx_gpio_set_value(gpio_output, led_status = GPIO_HIGH);
        goto clean;
    }
    if (strcmp(param, "off") == 0) {
        ldx_gpio_set_value(gpio_output, led_status = GPIO_LOW);
        goto clean;
    }
    snprintf(result, size, "Bad parameter <%s>", param);
clean:
    pthread_mutex_unlock(&led_mtx);
}

void user_method_led_get(char *param, char *result, size_t size)
{
    (void) param;
    snprintf(result, size, "{\"led\":\"%s\"}", GPIO_HIGH == led_status ? "on" : "off");
}

void led_blink(void)
{
    int i;

    for(i=0;i<5;i++)
    {
        pthread_mutex_lock(&led_mtx);
        ldx_gpio_set_value(gpio_output, led_status = GPIO_HIGH);
        pthread_mutex_unlock(&led_mtx);
        usleep(50000);
        pthread_mutex_lock(&led_mtx);
        ldx_gpio_set_value(gpio_output, led_status = GPIO_LOW);
        pthread_mutex_unlock(&led_mtx);
        usleep(50000);
    }
}