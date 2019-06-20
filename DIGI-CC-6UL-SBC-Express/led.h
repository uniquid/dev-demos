/*
 * Copyright (c) 2018. Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * led.h
 *
 *  Created on: 13/may/2018
 *      Author: M. Palumbi
 */

#pragma once
#ifndef __LED_H__
#define __LED_H__

void led_setup(void);
void user_method_led_set(char *param, char *result, size_t size);
void user_method_led_get(char *param, char *result, size_t size);
void led_blink(void);

#endif // __LED_H__
