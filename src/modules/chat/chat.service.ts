import { GoogleGenAI } from '@google/genai'
import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CohereClientV2 } from 'cohere-ai'

@Injectable()
export class ChatService {
  private readonly ia: GoogleGenAI
  private readonly cohere: CohereClientV2

  constructor(private readonly configService: ConfigService) {
    this.ia = new GoogleGenAI({
      apiKey: this.configService.getOrThrow('GOOGLE_GENAI_API_KEY'),
    })

    this.cohere = new CohereClientV2({
      token: this.configService.getOrThrow('COHERE_API_KEY'),
    })
  }

  async getResponnseAICohere(textoEntrada: string) {
    const prompt = `
Actúa como un asistente clínico. Lee el siguiente texto y extrae los datos en formato JSON.

Si algún dato no está presente, coloca null.

Campos requeridos:
- dni
- nombre
- edad
- es_nuevo_paciente (true o false)
- sintomas
- fecha

Texto:
"""${textoEntrada}"""
  `

    const response = await this.cohere.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: [
            {
              text: prompt,
              type: 'text',
            },
          ],
        },
      ],
      temperature: 0.3,
    })

    Logger.debug('Respuesta Cohere:', response)

    return response
  }

  async getResponse(textoEntrada: string) {
    const dniMatch = textoEntrada.match(/\b\d{8}\b/)
    if (!dniMatch)
      throw new BadRequestException(
        'DNI con número no encontrado. Usa formato como: DNI 70612345',
      )

    const dni = dniMatch[1]

    return {
      dni,
      textoEntrada,
    }
    const prompt = `
Eres un asistente clínico especializado en modificar registros de pacientes. A partir de una frase en lenguaje natural, extrae el DNI del paciente y los campos que deben ser actualizados. Devuelve un objeto JSON con esta estructura:

{
  "dni": "...",
  "actualizaciones": {
    "campo1": "nuevo valor",
    "campo2": "nuevo valor"
  }
}

Si no puedes encontrar el DNI, devuelve null en el campo "dni".

Ejemplo:

Entrada:
"Cambia la edad del paciente con DNI 70612345 a 34 y actualiza su diagnóstico a depresión moderada."

Respuesta:
{
  "dni": "70612345",
  "actualizaciones": {
    "edad": 34,
    "diagnostico": "depresión moderada"
  }
}

Frase:
"""${textoEntrada}"""
`

    const response = await this.ia.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    })

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text
    Logger.debug('Respuesta de Gemini:', text)
  }
}
