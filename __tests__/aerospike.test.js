const Aerospike = require('aerospike')

const setImmediatePromise = () => new Promise(resolve => {
    setImmediate(resolve);
})

const blockEventLoopForMs = (ms) => {
    const before = Date.now();

    while (Date.now() - before < ms) {}
};

jest.setTimeout(180000);

describe('Aerospike client', () => {
    const config = {
        hosts: '127.0.0.1:3000',
        log: {
            level: 7
        }
    };
    let client;

    const key = new Aerospike.Key('test', 'demo', 'demo');
    const totalTimeout = 4000;
    const writePolicy = new Aerospike.WritePolicy({totalTimeout});

    beforeAll(async () => {
        client = await Aerospike.connect(config);
    });

    afterAll(async () => {
        client.close();
    });

    it('should not throw timeout error on putting after blocking event loop with sync operation longer then totalTimeout', async () => {
        blockEventLoopForMs(totalTimeout + 1);

        try {
            await client.put(key, {foo: 'foo1'}, {}, writePolicy);
        } catch (err) {
            expect(err).toBeUndefined();
        }

        expect.assertions(0);
    });

    it('should not throw timeout error on putting after running async operation with one setImmediate call longer then totalTimeout', async () => {
        blockEventLoopForMs(totalTimeout / 2 + 1);
        await setImmediatePromise();
        blockEventLoopForMs(totalTimeout / 2);

        try {
            await client.put(key, {foo: 'foo1'}, {}, writePolicy);
        } catch (err) {
            expect(err).toBeUndefined();
        }

        expect.assertions(0);
    });

    it('should not throw timeout error on putting after running async operation with two setImmediate calls longer then totalTimeout', async () => {
        blockEventLoopForMs(totalTimeout / 2 + 1);
        await setImmediatePromise();
        await setImmediatePromise();
        blockEventLoopForMs(totalTimeout / 2);

        try {
            await client.put(key, {foo: 'foo1'}, {}, writePolicy);
        } catch (err) {
            expect(err).toBeUndefined();
        }

        expect.assertions(0);
    });
});
