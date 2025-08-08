import serial
import uinput
import time

# Serial config
SERIAL_PORT = '/dev/ttyACM0'
BAUD_RATE = 9600

# Axis range for joystick
AXIS_MIN = 0
AXIS_MAX = 255

# Create uinput device with needed events
device = uinput.Device([
    # Analog sticks (axes)
    uinput.ABS_X + (AXIS_MIN, AXIS_MAX, 0, 0),  # Left stick X
    uinput.ABS_Y + (AXIS_MIN, AXIS_MAX, 0, 0),  # Left stick Y
    uinput.ABS_Z + (AXIS_MIN, AXIS_MAX, 0, 0),  # Trigger or throttle
    uinput.ABS_RZ + (AXIS_MIN, AXIS_MAX, 0, 0), # Right stick Y (optional)

    # Buttons (common gamepad layout)
    uinput.BTN_SOUTH,  # A
    uinput.BTN_EAST,   # B
    uinput.BTN_NORTH,  # X
    uinput.BTN_WEST,   # Y
    uinput.BTN_TL,     # LB
    uinput.BTN_TR,     # RB
    uinput.BTN_SELECT, # Back
    uinput.BTN_START,  # Start
    uinput.BTN_THUMBL, # Left stick click
    uinput.BTN_THUMBR, # Right stick click
])

# Keep track of indicator state
indicator_state = {
    "left": False,
    "right": False,
    "brake": False
}

def handle_input(address, value):
    address = int(address)
    val = int(value)

    if address == 0:  # Left indicator
        if val == 1 and not indicator_state["left"]:
            device.emit(uinput.BTN_TL, 1)
            indicator_state["left"] = True
        elif val == 0 and indicator_state["left"]:
            device.emit(uinput.BTN_TL, 0)
            indicator_state["left"] = False

    elif address == 1:  # Right indicator
        if val == 1 and not indicator_state["right"]:
            device.emit(uinput.BTN_TR, 1)
            indicator_state["right"] = True
        elif val == 0 and indicator_state["right"]:
            device.emit(uinput.BTN_TR, 0)
            indicator_state["right"] = False

    elif address == 2:  # Steering wheel
        # Map 0-1023 to 0-255
        axis_val = max(AXIS_MIN, min(AXIS_MAX, int(val * 255 / 1023)))
        device.emit(uinput.ABS_X, axis_val, syn=False)

    elif address == 3:  # Speeds
        axis_val = max(AXIS_MIN, min(AXIS_MAX, int(val * 255 / 1023)))
        device.emit(uinput.ABS_Z, axis_val)

    elif address == 4:  # Right indicator
        if val == 1 and not indicator_state["brake"]:
            device.emit(uinput.BTN_SELECT, 1)
            indicator_state["brake"] = True
        elif val == 0 and indicator_state["brake"]:
            device.emit(uinput.BTN_SELECT, 0)
            indicator_state["brake"] = False

def main():
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print("Listening to serial... (Press Ctrl+C to stop)")

        while True:
            line = ser.readline().decode(errors='ignore').strip()
            if line:
                print(f"[Serial] {line}")
                parts = line.split(",")
                if len(parts) == 2:
                    handle_input(parts[0], parts[1])

    except serial.SerialException as e:
        print(f"[ERROR] Could not open serial port: {e}")
    except KeyboardInterrupt:
        print("Exiting...")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()

if __name__ == "__main__":
    main()
