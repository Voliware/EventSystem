/**
 * An event system based on jQuery's with namespace handling.
 * @example
 * let es = new EventSystem();
 * es.on('click', function(){
 *     console.log("click!");
 * });
 * es.on('click.you', function(){
 *     console.log("click you!")
 * });
 * es.emit("click"); // click! click you!
 * es.off("click.you");
 * es.emit("click"); // click!
 */
class EventSystem  {

    /**
     * Constructor
     * @returns {EventSystem}
     */
    constructor(){
        this.events = {};
        return this;
    }

    /**
     * Get the number of handlers for an event.
     * Will look through all namespaced events as well.
     * @param {string} event 
     * @returns {number}
     */
    getHandlersCount(event){
        let eventObject = this.events[event];
        if(!eventObject){
            return 0;
        }

        let count = 0;
        let stack = [];
        stack.push(eventObject);
        while (stack.length > 0) {
            let currentObj = stack.pop();   
    
            for (let k in currentObj) {
                if (k === "_handlers") {
                    count += currentObj[k].length;
                }
                else if (typeof currentObj[k] === 'object') {
                    stack.push(currentObj[k]);
                }
            }
        }
    
        return count;
    }

    /**
     * Attach an event.
     * Supports namespace handling.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {function} callback - a function to run when the event is emitted
     * @returns {EventSystem}
     */
    on(event, callback) {
        let eventArray = event.split('.');
  
        let lastObject = this.events;
        for (let i = 0; i < eventArray.length; i++) {
            let currentEventNamespace = eventArray[i];
            if (!lastObject[currentEventNamespace]) {
                lastObject[currentEventNamespace] = {};
            }
            if (i === eventArray.length - 1) {
                if (!Array.isArray(lastObject[currentEventNamespace]._handlers)) {
                    lastObject[currentEventNamespace]._handlers = [];
                }
                lastObject[currentEventNamespace]._handlers.push(callback);
            } 
            else {
                lastObject = lastObject[currentEventNamespace];
            }
        }
        return this;
    }

    /**
     * Attach and event that only runs once.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {function} callback - a function to run when the event is emitted
     * @returns {EventSystem}
     */
    one(event, callback) {
        let self = this;
        let newEventName = event + "." + String.random(8);
        let newCallback = function(data) {
            callback(data);
            self.off(newEventName);
        }
        this.on(newEventName, newCallback);
        return this;
    }
  
    /**
     * Remove an event.
     * If removeAllChildren is set to true, it will also remove any namespaced handlers.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {boolean} [removeAllChildHandlers=true] - whether to remove all child events
     * @returns {EventSystem}
     */
    off(event, removeAllChildHandlers = true) {
        let eventArray = event.split('.');

        let lastObject = this.events;
        for (let i = 0; i < eventArray.length; i++) {
            let currentEventNamespace = eventArray[i];
            if (i === eventArray.length - 1) {
                if (removeAllChildHandlers) {
                    delete lastObject[currentEventNamespace];
                } else {
                    delete lastObject[currentEventNamespace]._handlers;
                    if (Object.keys(lastObject[currentEventNamespace]).length === 0) {
                        delete lastObject[currentEventNamespace];
                    }
                }
            } else {
                lastObject = lastObject[currentEventNamespace];
            }
        }

        // todo: add a cleanup method to remove empty parents

        return this;
    }

    /**
     * Emit an event.
     * This will emit all namespaced child events.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @returns {EventSystem}
     */
    emit(event, data) {
        let eventArray = event.split('.');
        let lastObject = this.events;
        for (let i = 0; i < eventArray.length; i++) {
            let currentEventNamespace = eventArray[i];
            lastObject = lastObject[currentEventNamespace];
            // event does not exist
            if(!lastObject){
                return this;
            }
            
            if (i === eventArray.length - 1) {
                let stack = [];
                stack.push(lastObject);
                while(stack.length){
                    let obj = stack.pop();   
                    for (let k in obj) {
                        if (k === "_handlers") {
                            for (let x = 0; x < obj[k].length; x++) {
                                obj[k][x](data);
                            }
                        } else {
                            stack.push(obj[k]);
                        }
                    }
                }
            } 
        }

        return this;
    }
}