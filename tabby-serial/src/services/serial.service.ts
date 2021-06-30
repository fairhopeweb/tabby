import { Injectable, NgZone } from '@angular/core'
import SerialPort from 'serialport'
import { LogService, AppService, SelectorOption, ConfigService, NotificationsService, SelectorService } from 'tabby-core'
import { SettingsTabComponent } from 'tabby-settings'
import { SerialConnection, SerialSession, SerialPortInfo, BAUD_RATES } from '../api'
import { SerialTabComponent } from '../components/serialTab.component'

@Injectable({ providedIn: 'root' })
export class SerialService {
    private constructor (
        private log: LogService,
        private zone: NgZone,
        private notifications: NotificationsService,
        private app: AppService,
        private selector: SelectorService,
        private config: ConfigService,
    ) { }

    async listPorts (): Promise<SerialPortInfo[]> {
        return (await SerialPort.list()).map(x => ({
            name: x.path,
            description: x.manufacturer || x.serialNumber ? `${x.manufacturer || ''} ${x.serialNumber || ''}` : undefined,
        }))
    }

    createSession (connection: SerialConnection): SerialSession {
        const session = new SerialSession(connection)
        session.logger = this.log.create(`serial-${connection.port}`)
        return session
    }

    async connectSession (session: SerialSession): Promise<SerialPort> {
        const serial = new SerialPort(session.connection.port, {
            autoOpen: false,
            baudRate: parseInt(session.connection.baudrate as any),
            dataBits: session.connection.databits,
            stopBits: session.connection.stopbits,
            parity: session.connection.parity,
            rtscts: session.connection.rtscts,
            xon: session.connection.xon,
            xoff: session.connection.xoff,
            xany: session.connection.xany,
        })
        session.serial = serial
        let connected = false
        await new Promise(async (resolve, reject) => {
            serial.on('open', () => {
                connected = true
                this.zone.run(resolve)
            })
            serial.on('error', error => {
                this.zone.run(() => {
                    if (connected) {
                        this.notifications.error(error.toString())
                    } else {
                        reject(error)
                    }
                })
            })
            serial.on('close', () => {
                session.emitServiceMessage('Port closed')
                session.destroy()
            })

            try {
                serial.open()
            } catch (e) {
                this.notifications.error(e.message)
                reject(e)
            }
        })
        return serial
    }

    async showConnectionSelector (): Promise<void> {
        const options: SelectorOption<void>[] = []
        const foundPorts = await this.listPorts()

        try {
            const lastConnection = JSON.parse(window.localStorage.lastSerialConnection)
            if (lastConnection) {
                options.push({
                    name: lastConnection.name,
                    icon: 'fas fa-history',
                    callback: () => this.connect(lastConnection),
                })
                options.push({
                    name: 'Clear last connection',
                    icon: 'fas fa-eraser',
                    callback: () => {
                        window.localStorage.lastSerialConnection = null
                    },
                })
            }
        } catch { }

        for (const port of foundPorts) {
            options.push({
                name: port.name,
                description: port.description,
                icon: 'fas fa-arrow-right',
                callback: () => this.connectFoundPort(port),
            })
        }

        for (const connection of this.config.store.serial.connections) {
            options.push({
                name: connection.name,
                description: connection.port,
                callback: () => this.connect(connection),
            })
        }

        options.push({
            name: 'Manage connections',
            icon: 'cog',
            callback: () => this.app.openNewTabRaw({
                type: SettingsTabComponent,
                inputs: { activeTab: 'serial' },
            }),
        })

        options.push({
            name: 'Quick connect',
            freeInputPattern: 'Open device: %s...',
            icon: 'fas fa-arrow-right',
            callback: query => this.quickConnect(query),
        })


        await this.selector.show('Open a serial port', options)
    }

    async connect (connection: SerialConnection): Promise<SerialTabComponent> {
        try {
            const tab = this.app.openNewTab({
                type: SerialTabComponent,
                inputs: { connection },
            })
            if (connection.color) {
                (this.app.getParentTab(tab) ?? tab).color = connection.color
            }
            setTimeout(() => {
                this.app.activeTab?.emitFocused()
            })
            return tab
        } catch (error) {
            this.notifications.error(`Could not connect: ${error}`)
            throw error
        }
    }

    quickConnect (query: string): Promise<SerialTabComponent> {
        let path = query
        let baudrate = 115200
        if (query.includes('@')) {
            baudrate = parseInt(path.split('@')[1])
            path = path.split('@')[0]
        }
        const connection: SerialConnection = {
            name: query,
            port: path,
            baudrate: baudrate,
            databits: 8,
            parity: 'none',
            rtscts: false,
            stopbits: 1,
            xany: false,
            xoff: false,
            xon: false,
        }
        window.localStorage.lastSerialConnection = JSON.stringify(connection)
        return this.connect(connection)
    }

    async connectFoundPort (port: SerialPortInfo): Promise<SerialTabComponent> {
        const rate = await this.selector.show('Baud rate', BAUD_RATES.map(x => ({
            name: x.toString(), result: x,
        })))
        return this.quickConnect(`${port.name}@${rate}`)
    }
}
