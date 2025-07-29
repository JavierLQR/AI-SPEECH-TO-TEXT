import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class PushbulletService {
  private readonly ACCESS_TOKEN = ''
  private readonly PUSHBULLET_URL = 'https://api.pushbullet.com/v2/texts'

  constructor(private readonly httpService: HttpService) {}

  async sendTextMessage() {
    const guid = randomUUID() // Evita mensajes duplicados si llamas dos veces

    const payload = {
      data: {
        addresses: ['+51994724944'], // Teléfono(s) destino con código internacional
        message: 'Si te llego el mensaje responde por whatsap xdxd',
        target_device_iden: 'ujx2ZKV46pgsjDVWnBMiNo', // ID de tu celular Android
        guid, // identificador único del mensaje
        // file_type: 'image/jpeg', // si mandas imagen
      },
      iden: 'ujx2ZKV46pg',
      // file_url: 'https://dl.pushbulletusercontent.com/...', // si mandas imagen
      // skip_delete_file: true, // opcional
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.PUSHBULLET_URL, payload, {
          headers: {
            'Access-Token': this.ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        }),
      )

      console.log({
        data: response.data,
      })
    } catch (error) {
      console.error('Error al enviar SMS:', error)
    }
  }
}
