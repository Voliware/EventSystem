const EventSystem = require('./index');

let es = new EventSystem();
es.on('test', () => {
    console.log('it worked');
});
es.emit('test');
es.off('test');
es.emit('test');
es.one('test', () => {
    console.log('it worked again');
});
es.emit('test');
es.emit('test');