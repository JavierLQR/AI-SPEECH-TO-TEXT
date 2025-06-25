import { ChatMistralAI, MistralAIEmbeddings } from '@langchain/mistralai'

import { BaseMessageLike } from '@langchain/core/messages'
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config/dist/config.service'
import {
  Pinecone,
  QueryResponse,
  RecordMetadata,
} from '@pinecone-database/pinecone'
import { PrismaService } from 'nestjs-prisma'
import { getPrompt } from './prompt'
@Injectable()
export class PineconeService {
  private readonly pinecone: Pinecone
  private readonly mistralEmbeddings: MistralAIEmbeddings
  private readonly logger: Logger = new Logger(PineconeService.name)
  private readonly mistral: ChatMistralAI
  /**
   *
   * @param configService ConfigService to access environment variables
   * @description
   * This constructor injects the ConfigService, which is used to access environment variables.
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.pinecone = new Pinecone({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
    })
    this.mistral = new ChatMistralAI({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>('MISTRAL_MODEL'),
      temperature: 0.2, // Optional, adjust as needed

      maxTokens: 100, // Optional, adjust as needed
    })
    this.mistralEmbeddings = new MistralAIEmbeddings({
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      model: this.configService.getOrThrow<string>('MISTRAL_EMBEDDINGS_MODEL'),
    })
  }
  /**
   * Creates a Pinecone index with specified parameters.
   * @returns Promise<{ message: string; indexName: string }>
   * @throws InternalServerErrorException if index creation fails
   * @description
   * This method creates a Pinecone index named 'standard-dense-js' with dense vector type,
   * a dimension of 1536, and cosine metric. It uses serverless configuration for the index,
   * and disables deletion protection.
   */
  async createIndex() {
    this.logger.verbose('Fetching Pinecone index...')
    try {
      await this.pinecone.createIndex({
        name: 'standard-dense-js',
        vectorType: 'dense',
        dimension: 1024, // Adjusted to 1024 for compatibility with MistralAI embeddings
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
        deletionProtection: 'enabled',
        tags: { environment: 'development' },
      })
      this.logger.verbose('Pinecone index created successfully')
      return {
        message: 'Pinecone index created successfully',
        indexName: 'standard-dense-js',
      }
    } catch (error) {
      this.logger.error('Error creating Pinecone index:', error)
      throw new InternalServerErrorException('Failed to create Pinecone index')
    }
  }

  /**
   *
   * @returns Promise<any[]>
   * @description Converts a set of records into embeddings using MistralAI and returns them as an array.
   * This method simulates a dataset of historical, scientific, and cultural facts,
   * converting each record's text into embeddings for use in a Pinecone index.
   * @throws Error if embedding conversion fails
   * @example
   */
  private async convertedEmbeddings() {
    const records = [
      {
        _id: 'rec1',
        chunk_text:
          'The Eiffel Tower was completed in 1889 and stands in Paris, France.',
        category: 'history',
      },
      {
        _id: 'rec2',
        chunk_text:
          'Photosynthesis allows plants to convert sunlight into energy.',
        category: 'science',
      },
      {
        _id: 'rec3',
        chunk_text: 'Albert Einstein developed the theory of relativity.',
        category: 'science',
      },
      {
        _id: 'rec4',
        chunk_text:
          'The mitochondrion is often called the powerhouse of the cell.',
        category: 'biology',
      },
      {
        _id: 'rec5',
        chunk_text:
          'Shakespeare wrote many famous plays, including Hamlet and Macbeth.',
        category: 'literature',
      },
      {
        _id: 'rec6',
        chunk_text: 'Water boils at 100°C under standard atmospheric pressure.',
        category: 'physics',
      },
      {
        _id: 'rec7',
        chunk_text:
          'The Great Wall of China was built to protect against invasions.',
        category: 'history',
      },
      {
        _id: 'rec8',
        chunk_text:
          'Honey never spoils due to its low moisture content and acidity.',
        category: 'food science',
      },
      {
        _id: 'rec9',
        chunk_text:
          'The speed of light in a vacuum is approximately 299,792 km/s.',
        category: 'physics',
      },
      {
        _id: 'rec10',
        chunk_text: "Newton's laws describe the motion of objects.",
        category: 'physics',
      },
      {
        _id: 'rec11',
        chunk_text: 'The human brain has approximately 86 billion neurons.',
        category: 'biology',
      },
      {
        _id: 'rec12',
        chunk_text:
          'The Amazon Rainforest is one of the most biodiverse places on Earth.',
        category: 'geography',
      },
      {
        _id: 'rec13',
        chunk_text:
          'Black holes have gravitational fields so strong that not even light can escape.',
        category: 'astronomy',
      },
      {
        _id: 'rec14',
        chunk_text:
          'The periodic table organizes elements based on their atomic number.',
        category: 'chemistry',
      },
      {
        _id: 'rec15',
        chunk_text: 'Leonardo da Vinci painted the Mona Lisa.',
        category: 'art',
      },
      {
        _id: 'rec16',
        chunk_text:
          'The internet revolutionized communication and information sharing.',
        category: 'technology',
      },
      {
        _id: 'rec17',
        chunk_text:
          'The Pyramids of Giza are among the Seven Wonders of the Ancient World.',
        category: 'history',
      },
      {
        _id: 'rec18',
        chunk_text:
          'Dogs have an incredible sense of smell, much stronger than humans.',
        category: 'biology',
      },
      {
        _id: 'rec19',
        chunk_text:
          'The Pacific Ocean is the largest and deepest ocean on Earth.',
        category: 'geography',
      },
      {
        _id: 'rec20',
        chunk_text: 'Chess is a strategic game that originated in India.',
        category: 'games',
      },
      {
        _id: 'rec21',
        chunk_text:
          'The Statue of Liberty was a gift from France to the United States.',
        category: 'history',
      },
      {
        _id: 'rec22',
        chunk_text: 'Coffee contains caffeine, a natural stimulant.',
        category: 'food science',
      },
      {
        _id: 'rec23',
        chunk_text: 'Thomas Edison invented the practical electric light bulb.',
        category: 'inventions',
      },
      {
        _id: 'rec24',
        chunk_text:
          'The moon influences ocean tides due to gravitational pull.',
        category: 'astronomy',
      },
      {
        _id: 'rec25',
        chunk_text: 'DNA carries genetic information for all living organisms.',
        category: 'biology',
      },
      {
        _id: 'rec26',
        chunk_text: 'Rome was once the center of a vast empire.',
        category: 'history',
      },
      {
        _id: 'rec27',
        chunk_text: 'The Wright brothers pioneered human flight in 1903.',
        category: 'inventions',
      },
      {
        _id: 'rec28',
        chunk_text: 'Bananas are a good source of potassium.',
        category: 'nutrition',
      },
      {
        _id: 'rec29',
        chunk_text: 'The stock market fluctuates based on supply and demand.',
        category: 'economics',
      },
      {
        _id: 'rec30',
        chunk_text: 'A compass needle points toward the magnetic north pole.',
        category: 'navigation',
      },
      {
        _id: 'rec31',
        chunk_text:
          'The universe is expanding, according to the Big Bang theory.',
        category: 'astronomy',
      },
      {
        _id: 'rec32',
        chunk_text: 'Elephants have excellent memory and strong social bonds.',
        category: 'biology',
      },
      {
        _id: 'rec33',
        chunk_text:
          'The violin is a string instrument commonly used in orchestras.',
        category: 'music',
      },
      {
        _id: 'rec34',
        chunk_text: 'The heart pumps blood throughout the human body.',
        category: 'biology',
      },
      {
        _id: 'rec35',
        chunk_text: 'Ice cream melts when exposed to heat.',
        category: 'food science',
      },
      {
        _id: 'rec36',
        chunk_text: 'Solar panels convert sunlight into electricity.',
        category: 'technology',
      },
      {
        _id: 'rec37',
        chunk_text: 'The French Revolution began in 1789.',
        category: 'history',
      },
      {
        _id: 'rec38',
        chunk_text: 'The Taj Mahal is a mausoleum built by Emperor Shah Jahan.',
        category: 'history',
      },
      {
        _id: 'rec39',
        chunk_text:
          'Rainbows are caused by light refracting through water droplets.',
        category: 'physics',
      },
      {
        _id: 'rec40',
        chunk_text: 'Mount Everest is the tallest mountain in the world.',
        category: 'geography',
      },
      {
        _id: 'rec41',
        chunk_text: 'Octopuses are highly intelligent marine creatures.',
        category: 'biology',
      },
      {
        _id: 'rec42',
        chunk_text:
          'The speed of sound is around 343 meters per second in air.',
        category: 'physics',
      },
      {
        _id: 'rec43',
        chunk_text: 'Gravity keeps planets in orbit around the sun.',
        category: 'astronomy',
      },
      {
        _id: 'rec44',
        chunk_text:
          'The Mediterranean diet is considered one of the healthiest in the world.',
        category: 'nutrition',
      },
      {
        _id: 'rec45',
        chunk_text:
          'A haiku is a traditional Japanese poem with a 5-7-5 syllable structure.',
        category: 'literature',
      },
      {
        _id: 'rec46',
        chunk_text: 'The human body is made up of about 60% water.',
        category: 'biology',
      },
      {
        _id: 'rec47',
        chunk_text:
          'The Industrial Revolution transformed manufacturing and transportation.',
        category: 'history',
      },
      {
        _id: 'rec48',
        chunk_text: 'Vincent van Gogh painted Starry Night.',
        category: 'art',
      },
      {
        _id: 'rec49',
        chunk_text:
          'Airplanes fly due to the principles of lift and aerodynamics.',
        category: 'physics',
      },
      {
        _id: 'rec50',
        chunk_text:
          'Renewable energy sources include wind, solar, and hydroelectric power.',
        category: 'energy',
      },
    ]
    return await Promise.all(
      records.map(async (record) => {
        this.logger.debug(`Processing record: ${record._id}`)
        const values = await this.mistralEmbeddings.embedQuery(
          record.chunk_text,
        )
        return {
          id: record._id,
          values,
          metadata: {
            chunk_text: record.chunk_text,
            category: record.category,
          },
        }
      }),
    )
  }

  /**
   * Fetch the Pinecone index.
   * @returns Promise<{ message: string; indexName: string }>
   * @throws InternalServerErrorException if fetching the index fails
   */
  async upsertIndex() {
    this.logger.verbose('Fetching Pinecone index...')

    try {
      const index = this.pinecone.index('standard-dense-js').namespace('ns1')
      const recordsIndex = await this.convertedEmbeddings()
      await index.upsert(recordsIndex)
      this.logger.verbose('Pinecone index fetched successfully')
      return {
        message: 'Pinecone index fetched successfully',
        indexName: 'standard-dense-js',
      }
    } catch (error) {
      this.logger.error('Error fetching Pinecone index:', error)
      throw new InternalServerErrorException('Failed to fetch Pinecone index')
    }
  }

  /**
   * Queries the Pinecone index with a given query text.
   * @param queryText The text to query the index with.
   * @returns Promise<{ message: string; queryResponse: QueryResponse<RecordMetadata>,
   *  status: number }>
   * @throws InternalServerErrorException if querying the index fails
   */
  async queryIndex(queryText: string): Promise<{
    message: string
    queryResponse: QueryResponse<RecordMetadata>
    status: number
  }> {
    this.logger.verbose(`Querying Pinecone index with text: ${queryText}`)

    try {
      const index = this.pinecone.index('standard-dense-js').namespace('ns1')
      const queryEmbedding = await this.mistralEmbeddings.embedQuery(queryText)
      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
      })
      this.logger.verbose('Pinecone index queried successfully')
      return {
        message: 'Pinecone index queried successfully',
        queryResponse,
        status: HttpStatus.OK,
      }
    } catch (error) {
      this.logger.error('Error querying Pinecone index:', error)
      throw new InternalServerErrorException('Failed to query Pinecone index')
    }
  }

  async questionAI(newMessage: string) {
    // 1. Guardar el mensaje nuevo del usuario
    await this.prismaService.chatMessage.create({
      data: {
        userId: '1',
        role: 'user',
        content: newMessage,
      },
    })

    // 2. Obtener los últimos 10 mensajes del historial
    const history = await this.prismaService.chatMessage.findMany({
      where: { userId: '1' },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })

    const { queryResponse } = await this.queryIndex(newMessage)

    const contextChunks = queryResponse.matches
      .map((match) => {
        const chunkText =
          typeof match.metadata?.chunk_text === 'string'
            ? match.metadata.chunk_text
            : ''
        return `- ${chunkText}`
      })
      .join('\n')
    const systemPrompt = getPrompt(contextChunks)

    // 4. Convertir historial a formato del modelo
    const chatHistory: BaseMessageLike[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    const response = await this.mistral.invoke(chatHistory)

    // 6. Guardar respuesta del asistente en la DB
    await this.prismaService.chatMessage.create({
      data: {
        userId: '1',
        role: 'assistant',
        content: JSON.stringify(response.content),
      },
    })

    return {
      message: 'Respuesta generada exitosamente',
      answer: response.content,
      status: HttpStatus.OK,
    }
  }
}
