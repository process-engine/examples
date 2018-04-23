import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import {Express, Request, Response} from 'express';
import {Logger} from 'loggerhythm';
import {FaceRecognitionService} from './face_recognition_service';

const logger: Logger = Logger.createLogger('face recognition server');
const port: number = 3000;

export class FaceRecognitionServer {

  private app: Express;
  private faceRecognitionService: FaceRecognitionService;

  constructor(faceRecognitionService: FaceRecognitionService) {

    this.app = express();
    this.faceRecognitionService = faceRecognitionService;
  }

  public start(): void {

    this.app.use(cors());
    this.app.use(bodyParser.json(
      {
        limit: '50mb',
      }));
    this.app.use(bodyParser.urlencoded({
      extended: true,
    }));
    this.app.use('/static', express.static('frontend'));

    this.app.post('/add-user', (req: Request, res: Response) => {

      const {userName, imageDataURL} = req.body;
      this.faceRecognitionService.addUser(userName, imageDataURL)
        .then(() => {

          logger.info('User was added to database.');
          res.send('OK');
        }).catch((err: Error) => {

          res.status(500).send(err.message);
        });
    });

    this.app.post('/login', (req: Request, res: Response) => {
      const {userName, imageDataURL} = req.body;
      this.faceRecognitionService.userMatchesFaceId(userName, imageDataURL)
        .then((verified: boolean) => {

          const unauthorizedCode: number = 401;
          res.status(unauthorizedCode).send('User could not be verified');
        }).catch((err: Error) => {

          res.status(500).send(err.message);
        });
    });

    this.app.post('/generate-face-id', (req: Request, res: Response) => {
      const {imageDataURL} = req.body;
      this.faceRecognitionService.generateFaceId(imageDataURL)
        .then((faceId: string) => {

          res.send(faceId);
        }).catch((err: Error) => {

          res.status(500).send(err.message);
        });
    });

    this.app.listen(port, () => {
      logger.info('Face recognition server started.');
    });
  }

}
