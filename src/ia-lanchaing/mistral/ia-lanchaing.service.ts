import { ChatMistralAI, MistralAIEmbeddings } from '@langchain/mistralai'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pinecone } from '@pinecone-database/pinecone'

@Injectable()
export class IaLanchaingService {
  private readonly logger: Logger = new Logger(IaLanchaingService.name)
  private readonly embeddings: MistralAIEmbeddings
  private readonly model: ChatMistralAI
  private readonly pinecone: Pinecone
  constructor(private readonly configService: ConfigService) {
    this.embeddings = new MistralAIEmbeddings({
      // model: 'llama-text-embed-v2',
      model: this.configService.getOrThrow<string>('MISTRAL_EMBEDDINGS_MODEL'),
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
    })

    this.pinecone = new Pinecone({
      apiKey: this.configService.getOrThrow<string>('PINECONE_API_KEY'),
    })

    this.model = new ChatMistralAI({
      model: this.configService.getOrThrow<string>('MISTRAL_MODEL'),
      temperature: 0.2,
      apiKey: this.configService.getOrThrow<string>('MISTRAL_API_KEY'),
      metadata: {
        model: this.configService.getOrThrow<string>('MISTRAL_MODEL'),
      },
    })
  }

  async createIndex() {
    const indexName = 'developer-quickstart-js'
    await this.pinecone.createIndexForModel({
      name: 'developer-quickstart-js',
      cloud: 'aws',
      region: 'us-east-1',
      embed: {
        model: 'llama-text-embed-v2',
        fieldMap: { text: 'chunk_text' },
      },
      waitUntilReady: true,
    })
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
    const index = this.pinecone.index(indexName).namespace('ns1')
    await index.upsertRecords(records)
    return {
      message: 'Index created and data upserted successfully',
      indexName,
    }
  }

  /**
   * @returns Estadísticas del índice de Pinecone
   * @description Este método obtiene las estadísticas del índice de Pinecone.
   * Lo utiliza para verificar el estado del índice y asegurarse de que los datos se hayan indexado correctamente.
   * @throws InternalServerError Si ocurre un error al obtener las estadísticas del índice.
   */
  async verifyIndex() {
    const indexName = 'developer-quickstart-js'
    const namespace = 'ns1'
    const index = this.pinecone.index(indexName).namespace(namespace)
    return {
      stats: await index.describeIndexStats(),
      indexName,
    }
  }

  /**
   *
   * @returns Resultados de la consulta al índice de Pinecone
   * @description Este método consulta el índice de Pinecone utilizando un vector de consulta generado por MistralAIEmbeddings.
   * @throws InternalServerError Si ocurre un error al consultar el índice de Pinecone.
   * @param {QueryOptions} query - Opciones de consulta que incluyen el vector, topK y si se incluye metadata.
   */
  async findAllDataIndex() {
    const indexName = 'developer-quickstart-js'
    const namespace = 'ns1'
    const index = this.pinecone.index(indexName).namespace(namespace)
    const response = await index.searchRecords({
      query: {
        topK: 2,
        inputs: {
          text: '¿Qué estructuras históricas famosas existen en el mundo?',
        },
      },
      fields: ['chunk_text', 'category'],
    })

    const vector = await this.embeddings.embedQuery(
      '¿Qué estructuras históricas famosas existen en el mundo?',
    )
    const data = await index.query({
      vector,
      topK: 2,
      includeMetadata: true,
    })

    return {
      data,
      response,
    }
  }

  async getPromptModel() {
    const response = await this.model.invoke(
      'Hola, soy nuevo en el mundo de la IA, ¿me puedes ayudar?',
    )
    this.logger.log('Response from MistralAI:', { response })
    return {
      response,
    }
  }

  async getPromptEmbeddings() {
    const res = await this.embeddings.embedQuery('Hello world')
    this.logger.log('Response from MistralAIEmbeddings:', { res })
    return {
      res,
    }
  }
}
