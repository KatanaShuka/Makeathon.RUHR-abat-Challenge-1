using {abat.persistence} from '../db/schema';

@impl: 'srv/service.cjs'
service abat.services {
    entity Route as projection on abat.persistence.Route;
    entity Tour as projection on abat.persistence.Tour;
    entity betrifft as projection on abat.persistence.betrifft;
    entity Port as projection on abat.persistence.Port;
    entity Container as projection on abat.persistence.Container;
    entity faehrt as projection on abat.persistence.faehrt;
    entity Spedition as projection on abat.persistence.Spedition;
    entity Event as projection on abat.persistence.Event;
    entity Eventcodes as projection on abat.persistence.Eventcodes;
    entity Eventwarnings as projection on abat.persistence.Eventwarnings;

    action getTours() returns array of Tour;
}
