const Assert = require('assert');
const EventSystem = require('../index');
const es = new EventSystem();

const named_handler = () => {};

it('attaches a handler to an event', function() {
    es.on('test', () => {});
    Assert.strictEqual(es.getHandlersCount('test'), 1);
});

it('detaches a handler from an event', function() {
    es.on('test', () => {});
    es.off('test');
    Assert.strictEqual(es.getHandlersCount('test'), 0);
});

it('attaches a named handler to an event', function() {
    es.on('test', named_handler);
    Assert.strictEqual(es.getHandlersCount('test'), 1);
});

it('detaches a named handler from an event', function() {
    es.off('test', named_handler);
    Assert.strictEqual(es.getHandlersCount('test'), 0);
});

it('attaches a namespaced handler to an event', function() {
    es.on('test.a', () => {});
    es.on('test.b', () => {});
    Assert.strictEqual(es.getHandlersCount('test'), 2);
});

it('detaches a namespaced handler from an event', function() {
    es.on('test.a', () => {});
    es.on('test.b', () => {});
    es.off('test.a');
    Assert.strictEqual(es.getHandlersCount('test.a'), 0);
});

it('detaches all handlers from an event', function() {
    es.on('test.a', () => {});
    es.on('test.b', () => {});
    es.off('test');
    Assert.strictEqual(es.getHandlersCount('test'), 0);
});

it('detaches only namespaced handlers from an event', function() {
    es.on('test.a', () => {});
    es.on('test.b', () => {});
    es.off('test', null, false);
    Assert.strictEqual(es.getHandlersCount('test'), 2);
});

it('handles an event many times', function() {
    let v = 0;
    es.on('test', () => {
        v++;
    });
    es.emit('test');
    es.emit('test');
    Assert.strictEqual(v, 2);
});

it('handles an event one time', function() {
    let v = 0;
    es.one('test', () => {
        v++;
    });
    es.emit('test');
    es.emit('test');
    Assert.strictEqual(v, 1);
});

it('emits an event to a handler', function() {
    let v = 0;
    es.on('test', () => {
        v++;
    });
    es.emit('test');
    Assert.strictEqual(v, 1);
});

it('emits an event to namespaced handlers', function() {
    let v = 0;
    es.on('test.a', () => {
        v++;
    });
    es.on('test.b', () => {
        v++;
    });
    es.on('test.c.d', () => {
        v++;
    });
    es.emit('test');
    Assert.strictEqual(v, 3);
});

it('extends an object', function() {
    let v = 0;
    let o = {};
    EventSystem.extend(o);

    o.on('on', () => {
        v++;
    });

    o.emit('on');
    Assert.strictEqual(v, 1);

    o.one('one', () => {
        v++;
    });

    o.emit('one');
    o.emit('one');
    Assert.strictEqual(v, 2);
    
    o.off('on');
    o.emit('on');

    Assert.strictEqual(v, 2);
});