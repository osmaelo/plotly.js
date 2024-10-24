var Events = require('../../../src/lib/events');

describe('Events', function() {
    'use strict';

    var plotObj;
    var plotDiv;

    beforeEach(function() {
        plotObj = {};
        plotDiv = document.createElement('div');
    });

    describe('init', function() {
        it('instantiates an emitter on incoming plot object', function() {
            expect(plotObj._ev).not.toBeDefined();
            expect(Events.init(plotObj)._ev).toBeDefined();
        });

        it('maps function onto incoming plot object', function() {
            Events.init(plotObj);

            expect(typeof plotObj.on).toBe('function');
            expect(typeof plotObj.once).toBe('function');
            expect(typeof plotObj.removeListener).toBe('function');
            expect(typeof plotObj.removeAllListeners).toBe('function');
        });

        it('is idempotent', function() {
            Events.init(plotObj);
            plotObj.emit = function() {
                return 'initial';
            };

            Events.init(plotObj);
            expect(plotObj.emit()).toBe('initial');
        });

        it('triggers node style events', function(done) {
            Events.init(plotObj);

            plotObj.on('ping', function(data) {
                expect(data).toBe('pong');
                done();
            });

            setTimeout(function() {
                plotObj.emit('ping', 'pong');
            });
        });

        it('mirrors events on an internal handler', function(done) {
            Events.init(plotDiv);

            plotDiv._internalOn('ping', function(data) {
                expect(data).toBe('pong');
                done();
            });

            setTimeout(function() {
                plotDiv.emit('ping', 'pong');
            });
        });
    });

    describe('triggerHandler', function() {
        it('triggers node handlers and returns last value', function() {
            var eventBaton = 0;

            Events.init(plotDiv);

            plotDiv.on('ping', function() {
                eventBaton++;
                return 'ping';
            });

            plotDiv.on('ping', function() {
                eventBaton++;
                return 'ping';
            });

            plotDiv.on('ping', function() {
                eventBaton++;
                return 'pong';
            });

            var result = Events.triggerHandler(plotDiv, 'ping');

            expect(eventBaton).toBe(3);
            expect(result).toBe('pong');
        });

        it('does *not* mirror triggerHandler events on the internal handler', function() {
            var eventBaton = 0;
            var internalEventBaton = 0;

            Events.init(plotDiv);

            plotDiv.on('ping', function() {
                eventBaton++;
                return 'ping';
            });

            plotDiv._internalOn('ping', function() {
                internalEventBaton++;
                return 'foo';
            });

            plotDiv.on('ping', function() {
                eventBaton++;
                return 'pong';
            });

            var result = Events.triggerHandler(plotDiv, 'ping');

            expect(eventBaton).toBe(2);
            expect(internalEventBaton).toBe(0);
            expect(result).toBe('pong');
        });

        it('works with *once* event handlers', function() {
            var eventBaton = 0;

            Events.init(plotDiv);

            plotDiv.once('ping', function() {
                eventBaton++;
                return 'pong';
            });

            var result = Events.triggerHandler(plotDiv, 'ping');
            expect(result).toBe('pong');
            expect(eventBaton).toBe(1);

            var nop = Events.triggerHandler(plotDiv, 'ping');
            expect(nop).toBeUndefined();
            expect(eventBaton).toBe(1);
        });
    });

    describe('purge', function() {
        it('should remove all method from the plotObj', function() {
            Events.init(plotObj);
            Events.purge(plotObj);

            expect(plotObj).toEqual({});
        });
    });
});
