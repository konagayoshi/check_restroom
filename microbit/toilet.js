basic.forever(() => {
    if (pins.digitalReadPin(DigitalPin.P0) == 1) {
        basic.showIcon(IconNames.Heart)
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            `)
        basic.showString("Vocant")
    } else {
        basic.showIcon(IconNames.No)
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            `)
        basic.showString("Occupy")
    }
})
bluetooth.startButtonService()
bluetooth.startIOPinService()
pins.setPull(DigitalPin.P0, PinPullMode.PullUp)

