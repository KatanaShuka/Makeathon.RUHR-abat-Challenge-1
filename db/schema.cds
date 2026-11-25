namespace abat.persistence;

entity Route {
  key routen_id:UUID;
}

entity Tour {
  key tour_id:UUID;
      routen_id:Association to Route not null;
      source_port:Association to Port not null;
      dest_port:Association to Port not null;
}

entity betrifft {
  key tour_id:Association to Tour not null;
  key event_id:Association to Event not null;
}

entity Port {
  key location:String(8);
      name:String(100) not null;
      city:String(100) not null;
      postl_code:String(100) not null;
      street:String(100) not null;
      house_no:Integer;
      cr:String(2); 
}

entity Container {
  key bezeichnung:String(20) not null;
      tour_id:Association to Tour not null;
}

entity faehrt {
  key spedition_id:Association to Spedition not null;
  key tour_id:Association to Tour not null;
}

entity Spedition {
  key spedition_id:UUID;
      name:String(100) not null;
}

entity Event {
  key event_id:UUID;
      zeitraum_von:Date not null;
      zeitraum_bis:Date not null;
      betroffene_lokation:Association to Port not null;
      warnstufe:Association to Eventwarnings not null;
      event_bezeichnung:Association to Eventcodes not null;
}

entity Eventcodes {
  key bezeichnung:String(3);
      ereignis:String(100) not null;
}

entity Eventwarnings {
  @assert.range: [1,3]
  key warnstufe:Integer;
      auswirkung:String(100);
}



@cds.persistence.exists
@cds.persistence.name: 'tour_container'
entity TourContainer {
  key tour_id: UUID;
  container: String;
  source_port_location: String;
  dest_port_location: String;
}

@cds.persistence.exists
@cds.persistence.name: 'tour_spedition'
entity TourSpedition {
  key tour_id: UUID;
  spedition: String;
  source_port_location: String;
  dest_port_location: String;
}
