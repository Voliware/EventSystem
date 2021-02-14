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
     */
    constructor(){
        this.events = {};
    }

    /**
     * Generate a random string
     * @param {Number} length
     * @returns {String}
     */
    generateRandomString(length){
        let s = '';
        const randomchar = () => {
            const n = Math.floor(Math.random() * 62);
            if (n < 10) {
                return n;
            }
            if (n < 36) {
                return String.fromCharCode(n + 55);
            }               
            return String.fromCharCode(n + 61); 
        }

        while (s.length < length) {
            s += randomchar();
        }

        return s;
    }

    /**
     * Get the number of handlers for an event. Will look through all 
     * namespaced events as well.
     * @param {String} event 
     * @returns {Number}
     */
    getHandlersCount(event){
        const event_object = this.events[event];
        if(!event_object){
            return 0;
        }

        let count = 0;
        let stack = [];
        stack.push(event_object);
        while (stack.length > 0) {
            let current_obj = stack.pop();   
    
            for (let k in current_obj) {
                if (k === "handlers") {
                    count += current_obj[k].length;
                }
                else if (typeof current_obj[k] === 'object') {
                    stack.push(current_obj[k]);
                }
            }
        }
    
        return count;
    }

    /**
     * Attach an event. Supports namespace handling.
     * @param {String} event - An event such as click, or click.foo.bar
     * @param {Function} callback - A function to run when the event is emitted
     */
    on(event, callback) {
        if(typeof event !== "string"){
            event = event + '';
        }
        const event_array = event.split('.');
  
        let events_object = this.events;
        for (let i = 0; i < event_array.length; i++) {
            let current_event_namespace = event_array[i];
            if (!events_object[current_event_namespace]) {
                events_object[current_event_namespace] = {};
            }
            if (i === event_array.length - 1) {
                if (!Array.isArray(events_object[current_event_namespace].handlers)) {
                    events_object[current_event_namespace].handlers = [];
                }
                events_object[current_event_namespace].handlers.push(callback);
            } 
            else {
                events_object = events_object[current_event_namespace];
            }
        }
    }

    /**
     * Attach and event that only runs once.
     * @param {String} event - An event such as click, or click.foo.bar
     * @param {Function} callback - A function to run when the event is emitted
     */
    one(event, callback) {
        const new_event_name = event + "." + this.generateRandomString(16);
        const newCallback = (data) => {
            callback(data);
            this.off(new_event_name);
        }
        this.on(new_event_name, newCallback);
    }
  
    /**
     * Remove an event. If remove_all_child_handlers is set to true, it will
     * also remove any namespaced handlers.
     * @todo Add a cleanup method to remove empty parents
     * @param {String} event - An event such as click, or click.foo.bar
     * @param {Function} [callback=null] - Callback to remove. If not found, removes 
     * all callbacks for the event.
     * @param {boolean} [remove_all_child_handlers=true] - Whether to remove
     * all child events. Only applicable of callback is null.
     */
    off(event, callback = null, remove_all_child_handlers = true) {
        if(typeof event !== "string"){
            event = event + '';
        }
        const event_array = event.split('.');

        let events_object = this.events;
        for (let i = 0; i < event_array.length; i++) {
            const current_event_namespace = event_array[i];
            if (i === event_array.length - 1) {
                // Remove a specific callback
                if(callback){
                    const handlers = events_object[current_event_namespace].handlers;
                    for(let x = 0; x < handlers.length; x++){
                        if(handlers[x] === callback){
                            handlers.splice(x, 1);
                        }
                    }
                }
                else {
                    // Remove all child handlers, ie if event is "click",
                    // then also remove "click.foo", "click.foo.bar", etc.
                    if (remove_all_child_handlers) {
                        delete events_object[current_event_namespace];
                    } 
                    else {
                        delete events_object[current_event_namespace].handlers;
                        if (Object.keys(events_object[current_event_namespace]).length === 0) {
                            delete events_object[current_event_namespace];
                        }
                    }
                }
            } 
            else {
                events_object = events_object[current_event_namespace];
            }
        }

    }

    /**
     * Emit an event. This will emit all namespaced child events.
     * @param {String} event - An event such as click, or click.foo.bar
     * @param {*} data - Data to pass along with the event
     */
    emit(event, data) {
        if(typeof event !== "string"){
            event = event + '';
        }
        const event_array = event.split('.');
        let events_object = this.events;
        for (let i = 0; i < event_array.length; i++) {
            let current_event_namespace = event_array[i];
            events_object = events_object[current_event_namespace];
            // Event does not exist
            if(!events_object){
                return;
            }
            
            if (i === event_array.length - 1) {
                let stack = [];
                stack.push(events_object);
                while(stack.length){
                    let obj = stack.pop();   
                    for (let k in obj) {
                        if (k === "handlers") {
                            for (let x = 0; x < obj[k].length; x++) {
                                obj[k][x](data);
                            }
                        } 
                        else {
                            stack.push(obj[k]);
                        }
                    }
                }
            } 
        }
    }
}

if(typeof module !== "undefined"){
    module.exports = EventSystem;
}