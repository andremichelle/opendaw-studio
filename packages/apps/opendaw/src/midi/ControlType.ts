export const enum ControlType {
    NOTE_ON = 0x90,
    NOTE_OFF = 0x80,
    NOTE_AFTER_TOUCH = 0xa0,
    CONTROLLER = 0xb0,
    PROGRAM_CHANGE = 0xc0,
    CHANNEL_AFTER_TOUCH = 0xd0,
    PITCH_BEND = 0xe0,
}