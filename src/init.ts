import { App } from './app';
import { logger } from './observability/logger.service';


const application = new App();
application.start();

logger.info("Aplicación Iniciada");
