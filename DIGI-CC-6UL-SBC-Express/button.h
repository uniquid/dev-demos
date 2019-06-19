/*
 * Copyright (c) 2018. Uniquid Inc. or its affiliates. All Rights Reserved.
 *
 * License is in the "LICENSE" file accompanying this file.
 * See the License for the specific language governing permissions and limitations under the License.
 */

/*
 * button.h
 *
 *  Created on: 14/may/2018
 *      Author: M. Palumbi
 */


#include <stdbool.h>



#pragma once
#ifndef __BUTTON_H__
#define __BUTTON_H__

void button_setup(void);
bool button_is_pressed(void);

#endif // __BUTTON_H__
