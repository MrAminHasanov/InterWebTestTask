/* Check the comments first */

import { EventEmitter } from "./emitter";
import { EVENT_SAVE_DELAY_MS, EventDelayedRepository } from "./event-repository";
import { EventStatistics } from "./event-statistics";
import { ResultsTester } from "./results-tester";
import { triggerRandomly } from "./utils";

const MAX_EVENTS = 1000;

enum EventName {
  EventA = "A",
  EventB = "B",
}

const EVENT_NAMES = [EventName.EventA, EventName.EventB];

/*

  An initial configuration for this case

*/

function init() {
  const emitter = new EventEmitter<EventName>();

  triggerRandomly(() => emitter.emit(EventName.EventA), MAX_EVENTS);
  triggerRandomly(() => emitter.emit(EventName.EventB), MAX_EVENTS);

  const repository = new EventRepository();
  const handler = new EventHandler(emitter, repository);

  const resultsTester = new ResultsTester({
    eventNames: EVENT_NAMES,
    emitter,
    handler,
    repository,
  });
  resultsTester.showStats(20);
}

/* Please do not change the code above this line */
/* ----–––––––––––––––––––––––––––––––––––––---- */

/*

  The implementation of EventHandler and EventRepository is up to you.
  Main idea is to subscribe to EventEmitter, save it in local stats
  along with syncing with EventRepository.

*/

class EventHandler extends EventStatistics<EventName> {
  // Feel free to edit this class

  repository: EventRepository;

  constructor(emitter: EventEmitter<EventName>, repository: EventRepository) {
    super();
    this.repository = repository;

    let latestResponseDate = new Date().getTime() - EVENT_SAVE_DELAY_MS;

    EVENT_NAMES.map(eventName => {
      emitter.subscribe(eventName, async () => {
        const eventCount = this.getStats(eventName);
        const nowDate = new Date().getTime();

        this.setStats(eventName, eventCount + 1);

        if (nowDate > latestResponseDate + EVENT_SAVE_DELAY_MS) {
          this.repository.saveEventData(eventName, eventCount);
          latestResponseDate = nowDate;
        }
      });
    });
  }
}

class EventRepository extends EventDelayedRepository<EventName> {
  // Feel free to edit this class

  async saveEventData(eventName: EventName, handlerEventCount: number) {
    try {
      const updateEventValue = handlerEventCount - this.getStats(eventName);
      await this.updateEventStatsBy(eventName,updateEventValue);
    } catch (e) {
      // const _error = e as EventRepositoryError;
      // console.warn(error);
    }
  }
}

init();