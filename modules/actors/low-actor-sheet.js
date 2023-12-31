/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

import { LoWUtility } from "../common/low-utility.js";

/* -------------------------------------------- */
export class LoWActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {

    return mergeObject(super.defaultOptions, {
      classes: ["fvtt-legends-of-wulin", "sheet", "actor"],
      template: "systems/fvtt-legends-of-wulin/templates/actors/actor-sheet.hbs",
      width: 880,
      height:680,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
      editScore: true
    });
  }

  /* -------------------------------------------- */
  async getData() {

    let formData = {
      title: this.title,
      id: this.actor.id,
      type: this.actor.type,
      img: this.actor.img,
      name: this.actor.name,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      system: duplicate(this.object.system),
      limited: this.object.limited,
      skills: this.actor.getSkills(),
      externalStyles: this.actor.getExternalStyles(),
      internalStyles: this.actor.getInternalStyles(),
      conditions: this.actor.getConditions(),
      weaknesses: this.actor.getWeakness(),
      hyperactivities: this.actor.getHyperactivity(),
      config: duplicate(game.system.low.config),
      weapons: this.actor.getWeapons(),
      armors: this.actor.getArmors(),
      secretarts: this.actor.getSecretArts(),
      lores: this.actor.getLores(),
      subActors: duplicate(this.actor.getSubActors()),
      description: await TextEditor.enrichHTML(this.object.system.description, { async: true }),
      notes: await TextEditor.enrichHTML(this.object.system.notes, { async: true }),
      options: this.options,
      owner: this.document.isOwner,
      editScore: this.options.editScore,
      isGM: game.user.isGM
    }
    this.formData = formData;

    console.log("PC : ", formData, this.object);
    return formData;
  }


  /* -------------------------------------------- */
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    
    html.bind("keydown", function(e) { // Ignore Enter in actores sheet
      if (e.keyCode === 13) return false;
    });  

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let itemId = li.data("item-id")
      const item = this.actor.items.get( itemId );
      item.sheet.render(true);
    });
    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      LoWUtility.confirmDelete(this, li).catch("Error : No deletion confirmed")
    })
    html.find('.item-add').click(ev => {
      let dataType = $(ev.currentTarget).data("type")
      this.actor.createEmbeddedDocuments('Item', [{ name: "NewItem", type: dataType }], { renderSheet: true })
    })
    html.find('.wulin-item-checkbox').click(ev => {
      const li = $(ev.currentTarget).parents(".item")
      let dataType = li.data("item-type")
      let dataId = li.data("item-id")
      let field = $(ev.currentTarget).data("field")
      this.actor.updateItemCheck(dataType, dataId, field, ev.currentTarget.checked)
    })
     
    html.find('.subactor-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let actorId = li.data("actor-id");
      let actor = game.actors.get( actorId );
      actor.sheet.render(true);
    });
    
    html.find('.subactor-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      let actorId = li.data("actor-id");
      this.actor.delSubActor(actorId);
    });
    html.find('.quantity-minus').click(event => {
      const li = $(event.currentTarget).parents(".item");
      this.actor.incDecQuantity( li.data("item-id"), -1 );
    } );
    html.find('.quantity-plus').click(event => {
      const li = $(event.currentTarget).parents(".item");
      this.actor.incDecQuantity( li.data("item-id"), +1 );
    } );

    html.find('.roll-skill').click((event) => {
      let skillId = $(event.currentTarget).data("skill-id")
      this.actor.rollSkill(skillId)
    });    
    html.find('.roll-style').click((event) => {
      let styleId = $(event.currentTarget).data("style-id")
      this.actor.rollStyle(styleId)
    });    
    
    html.find('.river-flow').click((event) => {
      const diceIndex = $(event.currentTarget).data("dice-index");
      this.actor.flowDice(diceIndex);
    });    
    html.find('.river-flood').click((event) => {
      const diceIndex = $(event.currentTarget).data("dice-index");
      this.actor.floodDice(diceIndex);
    });    
    html.find('.river-wash').click((event) => {
      this.actor.washRiver();
    });    
    
    
    html.find('.roll-weapon').click((event) => {
      const armeId = $(event.currentTarget).data("arme-id")
      this.actor.rollArme(armeId)
    });
    
    html.find('.lock-unlock-sheet').click((event) => {
      this.options.editScore = !this.options.editScore;
      this.render(true);
    });    
    html.find('.item-equip').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.equipItem( li.data("item-id") );
      this.render(true);      
    });
    html.find('.update-field').change(ev => {
      const fieldName = $(ev.currentTarget).data("field-name");
      let value = Number(ev.currentTarget.value);
      this.actor.update( { [`${fieldName}`]: value } );
    });    
  }
  
  /* -------------------------------------------- */
  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */
  /** @override */
  _updateObject(event, formData) {
    // Update the Actor
    return this.object.update(formData);
  }
}
