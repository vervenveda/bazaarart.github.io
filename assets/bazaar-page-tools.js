(()=>{
"use strict";
const BA="https://vervenveda.com/bazaarart.github.io/";
const A=BA+"apps/";
const C=BA+"call_for_art_registry/";
const resources=Object.freeze({
 home:{label:"Bazaar Art",sub:"Creative center",href:BA},
 artResources:{label:"Art Resources",sub:"Reference & learning resources",href:A+"Art_resources_index.html"},
 sketchLab:{label:"Sketch Lab",sub:"Drawing workspace",href:A+"art_tool_sketch_lab_index.html"},
 advancedSketch:{label:"Advanced Sketch",sub:"Expanded drawing tools",href:A+"art_tool_advanced_sketch_index.html"},
 traceDraw:{label:"Trace & Draw",sub:"Observation & tracing aid",href:A+"art_tool_trace_draw_index.html"},
 colorStudio:{label:"Color Studio",sub:"Color exploration",href:A+"art_tool_color_studio_index.html"},
 simpleColor:{label:"Simple Color Studio",sub:"Focused color practice",href:A+"Art_simple_color_studio_index.html"},
 paletteForge:{label:"Palette Forge",sub:"Color game & palette practice",href:A+"Game_palette_forge_index.html"},
 spinSpire:{label:"SpinSpire",sub:"Art prompt generator",href:A+"SpinSpire_Art_Prompt_Generator_index.html"},
 inspirationWheel:{label:"Inspiration Wheel",sub:"Creative prompt spinner",href:A+"Inspiration_wheel_index.html"},
 creator:{label:"Creator Compass",sub:"Creative identity prompts",href:A+"Inspiration_Kind_of_Creator_index.html"},
 photo:{label:"Photo Album Studio",sub:"Document & organize artwork",href:A+"Photo_Album_Studio/"},
 gallery:{label:"My Art Gallery",sub:"Portfolio & exhibition",href:"https://vervenveda.com/myartgallery.github.io/"},
 academy:{label:"Bazaar Art Academy",sub:"Structured art learning",href:BA+"academy/"},
 artHall:{label:"Art Hall",sub:"Art study & context",href:A+"Class_art_hall_index.html"},
 education:{label:"Art Education",sub:"Course gateway",href:A+"Class_art_education_portal_index.html"},
 art101:{label:"Art 101",sub:"Foundation course",href:A+"Class_art_101_index.html"},
 art201:{label:"Art 201",sub:"Intermediate course",href:A+"Class_art_201_index.html"},
 art301:{label:"Art 301",sub:"Advanced course",href:A+"Class_art_301_index.html"},
 atlas:{label:"Elementary Art Atlas",sub:"Foundational art ideas",href:A+"Elementary_Art_Atlas_index.html"},
 registry:{label:"Call for Art Registry",sub:"Verified opportunity discovery",href:C+"call_for_art_registry.html"},
 registryGuide:{label:"Registry Guide",sub:"Trust & verification guide",href:C+"call_for_art_registry_landing.html"},
 refrain:{label:"The Refrain",sub:"Music creative center",href:"https://vervenveda.com/the_refrain.github.io/"},
 composer:{label:"Composer",sub:"Vivoser composition studio",href:A+"composition/vivoser-composer_index.html"},
 staff:{label:"Staff Studio",sub:"Notation workspace",href:A+"composition/staff-studio_index.html"},
 keyboard:{label:"Keyboard",sub:"Playable music keyboard",href:A+"instruments/pro-keyboard_index.html"},
 affirm:{label:"Affirmations",sub:"Creative reset",href:A+"Affirmations_index.html"},
 kindness:{label:"Act of Kindness",sub:"Reflective creative prompt",href:A+"Act_of_Kindness_index.html"}
});
window.BazaarArtToolsCatalogV1=resources;

const L=x=>({type:"link",...x});
const translator={type:"translator",label:"Translator",sub:"Page language controls"};
const help=(title,paragraphs)=>({type:"help",label:"Help",sub:"Page guidance",title,paragraphs});
const p=location.pathname.toLowerCase();

function has(...parts){return parts.some(x=>p.includes(x))}
function config(){
 let id="bazaar-art-default",aria="Bazaar Art page tools",tools=[
   L(resources.home),L(resources.artResources),L(resources.spinSpire),L(resources.photo),translator,
   help("Bazaar Art Tools",["These lower-left tools are selected for this Bazaar Art page.","The lower-right ecosystem toolbar remains the separate Verve N Veda ecosystem dock."])
 ];

 if(has("/call_for_art_registry/admin/")){
   id="bazaar-art-registry-admin";aria="Call for Art verification tools";tools=[
     L(resources.registry),L(resources.registryGuide),L(resources.artResources),L(resources.gallery),translator,
     help("Verification Workbench",["Use the workbench for evidence review and verification decisions.","Use the public registry to confirm how artist-facing records appear. Automation never grants Verified Current."])
   ];
 }else if(has("/call_for_art_registry/")){
   id="bazaar-art-registry";aria="Call for Art Registry tools";tools=[
     L(resources.registry),L(resources.registryGuide),L(resources.artResources),L(resources.gallery),translator,
     help("Call for Art Registry",["Use the registry to discover opportunities and verify current terms on the official organizer page.","Community experience reviews do not determine factual validity."])
   ];
 }else if(has("/academy/","class_art_101","class_art_201","class_art_301","class_art_education","class_art_hall","elementary_art_atlas","/classes/art-class/")){
   id="bazaar-art-learning";aria="Bazaar Art learning tools";tools=[
     L(resources.academy),L(resources.artHall),L(resources.education),L(resources.artResources),translator,
     help("Art Learning Tools",["Use these links to move between structured art study, reference resources, and the Bazaar Art learning center.","Course-specific lesson controls remain inside the lesson itself."])
   ];
 }else if(has("advanced_sketch","sketch_lab","trace_draw","sagaen")){
   id="bazaar-art-drawing";aria="Bazaar Art drawing tools";tools=[
     L(resources.sketchLab),L(resources.advancedSketch),L(resources.traceDraw),L(resources.colorStudio),L(resources.spinSpire),translator,
     help("Drawing Studio Tools",["Sketch Lab supports quick studies; Advanced Sketch supports expanded drawing work; Trace & Draw supports observation practice.","Use SpinSpire when you need a subject or constraint rather than adding random decoration."])
   ];
 }else if(has("color_studio","simple_color","palette_forge")){
   id="bazaar-art-color";aria="Bazaar Art color tools";tools=[
     L(resources.colorStudio),L(resources.simpleColor),L(resources.paletteForge),L(resources.sketchLab),L(resources.artResources),translator,
     help("Color & Composition Tools",["Use Color Studio for deliberate color relationships and Simple Color Studio for focused practice.","Palette Forge is for experimentation; preserve actual lesson evidence separately."])
   ];
 }else if(has("spinspire","inspiration_wheel","kind_of_creator","affirmation","kindness")){
   id="bazaar-art-inspiration";aria="Bazaar Art inspiration tools";tools=[
     L(resources.spinSpire),L(resources.inspirationWheel),L(resources.creator),L(resources.artResources),L(resources.affirm),translator,
     help("Inspiration Tools",["Prompts are starting points, not grading criteria.","Use the smallest useful prompt or constraint and return to making rather than endlessly generating ideas."])
   ];
 }else if(has("photo_album","photo_album_studio")){
   id="bazaar-art-photo";aria="Bazaar Art photo and portfolio tools";tools=[
     L(resources.photo),L(resources.gallery),L(resources.artResources),L(resources.colorStudio),translator,
     help("Photo & Portfolio Tools",["Document artwork clearly before decorative editing.","Keep an accurate master image for evidence and portfolio records."])
   ];
 }else if(has("/composition/","/instruments/","sound-labs","music_","song-embedder")){
   id="bazaar-art-music";aria="Bazaar Art music tools";tools=[
     L(resources.refrain),L(resources.composer),L(resources.staff),L(resources.keyboard),translator,
     help("Music Creation Tools",["The Refrain is the primary music center; Bazaar Art music utilities remain available here as creative tools.","Use the notation and keyboard tools as working aids, not as substitutes for course evidence."])
   ];
 }
 return Object.freeze({id,match:()=>true,toggleLabel:"Tools",ariaLabel:aria,tools});
}
window.KhaemenesClassToolsConfigV1=config();
})();