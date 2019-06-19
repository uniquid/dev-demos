/*
 * Copyright (c) 2018. Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * button.c
 *
 *  Created on: 14/may/2018
 *      Author: M. Palumbi
 */

/*
 * DESCRIPTION
 * Utilities to test the button status on the
 * Digi ConnectCore 6UL SBC Express
 */

#include <stdio.h>
#include <stdlib.h>
#include "button.h"
#include "led.h"

#include <libdigiapix/gpio.h>


static gpio_t *gpio_input;

/* Interrupt callback */
static int led_toggle_cb(void* arg)
{
    (void) arg;
    char result[] = "";
    user_method_led_set("toggle", result, sizeof(result));
    return EXIT_SUCCESS;
}

/**
 * Setup the button
 */
void button_setup(void)
{
    int led = ldx_gpio_get_kernel_number("USER_BUTTON");

    /* Request input GPIO */
    gpio_input =
        ldx_gpio_request((unsigned int)led, GPIO_IRQ_EDGE_RISING, REQUEST_SHARED);
    if (!gpio_input) {
        printf("Failed to initialize input GPIO\n");
        return;
    }
    /* Start capturing interrupts */
    ldx_gpio_start_wait_interrupt(gpio_input, led_toggle_cb, NULL);
}

bool button_is_pressed(void)
{
    return (GPIO_LOW == ldx_gpio_get_value(gpio_input));
}
