import serial
import pyvjoy
import time

SERIAL_PORT = 'COM3'
BAUD_RATE = 9600


VJOY_AXIS_MIN = 0
VJOY_AXIS_MAX = 32768


j = pyvjoy.VJoyDevice(1)

button_state = {
    "left": False,
    "right": False,
    "brake": False
}

BUTTON_MAP = {
    "LEFT_INDICATOR": 5,   # LB
    "RIGHT_INDICATOR": 6,  # RB
    "BRAKE": 7,
}

def map_value(val, from_min, from_max, to_min, to_max):
    val = max(from_min, min(from_max, val))
    return int((val - from_min) * (to_max - to_min) / (from_max - from_min) + to_min)

def handle_input(address, value):
    address = int(address)
    val = int(value)

    if address == 0:
        if val == 1 and not button_state["left"]:
            j.set_button(BUTTON_MAP["LEFT_INDICATOR"], 1)
            button_state["left"] = True
        elif val == 0 and button_state["left"]:
            j.set_button(BUTTON_MAP["LEFT_INDICATOR"], 0)
            button_state["left"] = False

    elif address == 1:
        if val == 1 and not button_state["right"]:
            j.set_button(BUTTON_MAP["RIGHT_INDICATOR"], 1)
            button_state["right"] = True
        elif val == 0 and button_state["right"]:
            j.set_button(BUTTON_MAP["RIGHT_INDICATOR"], 0)
            button_state["right"] = False

    elif address == 2:
        axis_val = map_value(val, 0, 1023, VJOY_AXIS_MIN, VJOY_AXIS_MAX)
        j.set_axis(pyvjoy.HID_USAGE_X, axis_val)

    elif address == 3:
        axis_val = map_value(val, 0, 1023, VJOY_AXIS_MIN, VJOY_AXIS_MAX)
        j.set_axis(pyvjoy.HID_USAGE_Z, axis_val)

    elif address == 4:
        if val == 1 and not button_state["brake"]:
            j.set_button(BUTTON_MAP["BRAKE"], 1)
            button_state["brake"] = True
        elif val == 0 and button_state["brake"]:
            j.set_button(BUTTON_MAP["BRAKE"], 0)
            button_state["brake"] = False

def main():
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        print("listening to serial")

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
