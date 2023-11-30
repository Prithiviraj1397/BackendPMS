import *  as  winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
    winston.format(info => {
        info.level = info.level.toUpperCase()
        info.message = JSON.stringify(info.message, null, 2).replace(/\t|\n/g, '');
        return info;
    })(),
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.align(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${level}] ${message}`
    })
);

const dailyRotateFileTransport: DailyRotateFile = new DailyRotateFile({
    filename: 'src/logs/%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '2d'
});

// transport.on('rotate', function (oldFilename, newFilename) {
//     // do something fun
// });

export const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        dailyRotateFileTransport,
        new winston.transports.Console({
            stderrLevels: ['error'],
        }),
    ],
});
