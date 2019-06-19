
EXEFILE := demo
OBJDIR := obj
EXEDIR := bin

LIBS		+= -lcurl -lpthread

EXTRA_LIBS		+= -Wl,-rpath='$$ORIGIN'
EXTRA_LIBS		+= -L./uidcore-c/trezor-crypto -ltrezor-crypto
EXTRA_LIBS		+= -L./uidcore-c -luidcore-c


unexport CFLAGS
CFLAGS :=
CFLAGS   += -W \
            -Wall \
            -Wextra \
            -Wimplicit-function-declaration \
            -Wredundant-decls \
            -Wstrict-prototypes \
            -Wundef \
            -Wshadow \
            -Wpointer-arith \
            -Wformat \
            -Wreturn-type \
            -Wsign-compare \
            -Wmultichar \
            -Wformat-nonliteral \
            -Winit-self \
            -Wuninitialized \
            -Wformat-security \
            -Werror

EXTRA_CFLAGS	+= -I./uidcore-c -std=gnu99 -D DEBUG
EXTRA_CFLAGS	+= -I./uidcore-c/yajl/build/yajl-2.1.1/include
EXTRA_CFLAGS	+= -I./uidcore-c/trezor-crypto

EXTRA_CFLAGS += $(shell pkg-config --cflags libdigiapix)
EXTRA_LIBS += $(shell pkg-config --libs libdigiapix)

OBJS := helpers.o engine.o mqtt_transport.o token.o main.o led.o button.o
#OBJS += demo.o led.o button.o rgb_lcd.o logger.o diagnostic.o power_line.o
#OBJS += btgatt-server.o uuid-helper.o
OBJS := $(addprefix $(OBJDIR)/,$(OBJS))

.PHONY: all
all: $(EXEDIR)/$(EXEFILE)

# build uidcore-c library
uidcore-c/libuidcore-c.so:
	make -C uidcore-c

# mbedtls targets
TLS_LIB_DIR := mbedtls/library
TLS_INCLUDE_DIR = -I mbedtls/include

$(TLS_LIB_DIR)/libmbedtls.a:
	make -C mbedtls lib

$(TLS_LIB_DIR)/libmbedcrypto.a:
	make -C mbedtls lib

$(TLS_LIB_DIR)/libmbedx509.a:
	make -C mbedtls lib

# aws IoT lib
#IoT client directory
IOT_CLIENT_DIR = aws-iot-device-sdk-embedded-C

PLATFORM_DIR = $(IOT_CLIENT_DIR)/platform/linux/mbedtls
PLATFORM_COMMON_DIR = $(IOT_CLIENT_DIR)/platform/linux/common

IOT_INCLUDE_DIRS += -I $(IOT_CLIENT_DIR)/include
IOT_INCLUDE_DIRS += -I $(IOT_CLIENT_DIR)/external_libs/jsmn
IOT_INCLUDE_DIRS += -I $(PLATFORM_COMMON_DIR)
IOT_INCLUDE_DIRS += -I $(PLATFORM_DIR)

IOT_SRC_FILES += $(shell find $(IOT_CLIENT_DIR)/src/ -name '*.c')
IOT_SRC_FILES += $(shell find $(IOT_CLIENT_DIR)/external_libs/jsmn -name '*.c')
IOT_SRC_FILES += $(shell find $(PLATFORM_DIR)/ -name '*.c')
IOT_SRC_FILES += $(shell find $(PLATFORM_COMMON_DIR)/ -name '*.c')

INCLUDE_ALL_DIRS += $(IOT_INCLUDE_DIRS) $(TLS_INCLUDE_DIR) -I ./ -I uidagent-c 

# Logging level control
LOG_FLAGS += -DENABLE_IOT_DEBUG
LOG_FLAGS += -DENABLE_IOT_INFO
LOG_FLAGS += -DENABLE_IOT_WARN
LOG_FLAGS += -DENABLE_IOT_ERROR

COMPILER_FLAGS += $(LOG_FLAGS)

libAwsIotSdk.a: $(IOT_SRC_FILES:.c=.o)
	ar rcs $@ $^


%.o : %.c
	$(CC) -c $< -o $@ $(COMPILER_FLAGS) $(EXTERNAL_LIBS) $(INCLUDE_ALL_DIRS)


# build the target
$(EXEDIR)/$(EXEFILE): uidcore-c/libuidcore-c.so $(OBJS) libAwsIotSdk.a  $(TLS_LIB_DIR)/libmbedtls.a $(TLS_LIB_DIR)/libmbedcrypto.a $(TLS_LIB_DIR)/libmbedx509.a
	@mkdir -p $(EXEDIR)
	$(CC) -o $@ $(OBJS) $(EXTRA_LIBS) $(LIBS) libAwsIotSdk.a  -ldl $(TLS_LIB_DIR)/libmbedtls.a $(TLS_LIB_DIR)/libmbedcrypto.a $(TLS_LIB_DIR)/libmbedx509.a
	cp S99uniquid-demo $(EXEDIR)
	chmod  a+x $(EXEDIR)/S99uniquid-demo
	# copy the libraries
	@cp uidcore-c/libuidcore-c.so $(EXEDIR)
	@cp uidcore-c/trezor-crypto/libtrezor-crypto.so $(EXEDIR)


EXTRA_CFLAGS += $(INCLUDE_ALL_DIRS) $(LOG_FLAGS)

$(OBJDIR)/%.o: %.c
	@mkdir -p $(OBJDIR)
	$(CC) $(CFLAGS) $(EXTRA_CFLAGS) -c -o $@ $<

$(OBJDIR)/%.o: uidagent-c/%.c
	@mkdir -p $(OBJDIR)
	$(CC) $(CFLAGS) $(EXTRA_CFLAGS) -c -o $@ $<

#
# Utility rules
#
.PHONY: clean
clean:
	rm -rf $(OBJDIR)
	rm -rf $(EXEDIR)
	rm -f libAwsIotSdk.a
	rm -f $(shell find aws-iot-device-sdk-embedded-C/ -name '*.o')
	make -C uidcore-c clean
	make -C mbedtls clean

.PHONY: clean_repo
clean_repo:
	rm -rf uidcore-c
	rm -rf aws-iot-device-sdk-embedded-C
	rm -rf mbedtls

UIDCORE_C_BRANCH = v2.0.0
.PHONY: clone_repo
clone_repo:
	git clone --recurse-submodules https://github.com/uniquid/uidcore-c.git -b $(UIDCORE_C_BRANCH)
	git clone https://github.com/aws/aws-iot-device-sdk-embedded-C.git -b v3.0.1
	git -C aws-iot-device-sdk-embedded-C/ apply ../uidagent-c/IoT-sdk.patch
	git clone https://github.com/ARMmbed/mbedtls.git -b mbedtls-2.16.0