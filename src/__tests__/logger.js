// @flow

import Logger from '../logger';

describe('Logger', () => {
    beforeEach(() => {
        spyOn(console, 'log');
    });

    afterEach(() => {
        delete process.env.LOG_LEVEL;
    });

    it('does not log when level is not allowed', () => {
        process.env.LOG_LEVEL = 'normal';
        const { log } = new Logger('test.js');
        log('foo', 'verbose');

        expect(console.log).toHaveBeenCalledTimes(0);
    });

    it('logs when level is allowed', () => {
        process.env.LOG_LEVEL = 'verbose';
        const { log } = new Logger('test.js');
        log('foo', 'verbose');

        expect(console.log).toHaveBeenCalledTimes(1);
    });

    it('defaults to normal log level when not provided to `log`', () => {
        const logger = new Logger('test.js');
        expect(logger.level).toBe(0);
    });
});
