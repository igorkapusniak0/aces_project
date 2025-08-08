import serial
import uinput
import time

SERIAL_PORT = '/dev/ttyACM0'
BAUD_RATE = 9600

AXIS_MIN = 0
AXIS_MAX = 255

device = uinput.Device([
    uinput.ABS_X + (AXIS_MIN, AXIS_MAX, 0, 0), 
    uinput.ABS_Y + (AXIS_MIN, AXIS_MAX, 0, 0),  
    uinput.ABS_Z + (AXIS_MIN, AXIS_MAX, 0, 0),  
    uinput.ABS_RZ + (AXIS_MIN, AXIS_MAX, 0, 0),

    uinput.BTN_SOUTH,  
    uinput.BTN_EAST,   
    uinput.BTN_NORTH,  
    uinput.BTN_WEST,   
    uinput.BTN_TL,     
    uinput.BTN_TR,     
    uinput.BTN_SELECT, 
    uinput.BTN_START,  
    uinput.BTN_THUMBL, 
    uinput.BTN_THUMBR, 
])

indicator_state = {
    "left": False,
    "right": False,
    "brake": False
}

def handle_input(address, value):
    address = int(address)
    val = int(value)

    if address == 0: 
        if val == 1 and not indicator_state["left"]:
            device.emit(uinput.BTN_TL, 1)
            indicator_state["left"] = True
        elif val == 0 and indicator_state["left"]:
            device.emit(uinput.BTN_TL, 0)
            indicator_state["left"] = False

    elif address == 1:
        if val == 1 and not indicator_state["right"]:
            device.emit(uinput.BTN_TR, 1)
            indicator_state["right"] = True
        elif val == 0 and indicator_state["right"]:
            device.emit(uinput.BTN_TR, 0)
            indicator_state["right"] = False

    elif address == 2:
    
        axis_val = max(AXIS_MIN, min(AXIS_MAX, int(val * 255 / 1023)))
        device.emit(uinput.ABS_X, axis_val, syn=False)

    elif address == 3:  
        axis_val = max(AXIS_MIN, min(AXIS_MAX, int(val * 255 / 1023)))
        device.emit(uinput.ABS_Z, axis_val)

    elif address == 4:  
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
