/**
* OHQ Frontend
* @author kyle@kylehardgrave.com (Kyle Hardgrave)
*/

'use strict';

var ohq = window.ohq = window.ohq || {
  SOCKET_SERVER: 'http://localhost:8080/',
  templates: {},
  socket: null
};


/**
 * The model for all individual members of the queue.
 * @property {string} name
 * @property {int} enqueueTime
 * @property {boolean} canEdit If this model can be edited by the current
 *     user.
 */
ohq.QueueItem = Backbone.Model.extend({

  defaults: function() {
    return { canEdit: false };
  },

  initialize: function() {
    console.log('Call initialize');
    this.set({ enqueueTime: (new Date()).getTime() });
  },

  validate: function(attrs) {
    if (!$.trim(attrs.name))
      return "A QueueItem must have a name.";
    if (!attrs.enqueueTime || 
        typeof attrs.enqueueTime != 'number')
      return "A QueueItem must have an integer timestamp.";
    if (attrs.enqueueTime > (new Date()).getTime())
      return "A QueueItem must have a timestamp in the past.";
  }

});


/**
 * A collection of queue members, which in this case _is_ the queue.
 */
ohq.Queue = Backbone.Collection.extend({

  model: ohq.QueueItem,

  comparator: function(queueItem) {
    return queueItem.get('enqueueTime');
  }

});


/**
 * Queue Item View
 * @property {ohq.QueueItem} model The corresponding model, since models 
 *     views have a 1:1 relationship here.
 */
ohq.QueueItemView = Backbone.View.extend({

  template: Handlebars.compile($('#queue_item-tpl').html()),

  events: {
    'click .remove': 'remove'
  },

  initialize: function() {
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },

  // Convert the pure model into an object to be used for rendering a 
  // Handlebars template
  toTemplateMap: function() {
    var map = ohq.jsonToTemplateMap(this.model.toJSON());
    map['human_enqueue_time'] = 
        ohq.humanizeTime(this.model.get('enqueueTime'));
    return map;
  },

  render: function() {
    console.log(this.toTemplateMap());
    this.el = this.template(this.toTemplateMap());
    return this;
  }, 

});


/**
 * The main application view, responsible for governing everything else.
 * @property {jQuery} inputForm
 * @property {jQuery} queueUi
 * @param {ohq.Queue} collection The underlying Collection
 */
ohq.AppView = Backbone.View.extend({

  el: $('#main'),

  events: {
    'submit #enqueue-form': 'submitName'
  },

  initialize: function() {
    this.inputForm = this.$('#enqueue-form');
    this.queueUi = this.$('#queue');

    // Event bindings
    this.collection.on('add', this.enqueueName, this);
  },

  // Triggered by form submit. Adds a new model to the Queue Collection.
  submitName: function(event) {
    event.preventDefault(); // Prevent form submission
    this.collection.create({ name: this.$('#name').val() });
    this.$('#name').val('');
  },

  // Listens to the Queue Collection and adds a model view to the UI.
  enqueueName: function(queueItem) {
    var queueItemView = new ohq.QueueItemView({ model: queueItem });
    this.queueUi.append(queueItemView.render().el);
  },

  // Adds a view for *all* the items in the Queue Collection.
  enqueueAllNames: function() {
    this.collection.each(this.enqueueName);
  }

});


// App Functions
// -------------
ohq.jsonToTemplateMap = function(json) {
  var map = {};
  for (var key in json)
    map[ohq.toUnderscore(key)] = json[key];
  return map;
};

ohq.toUnderscore = function(str) {
  return str.replace(/[A-Z]/g, '_$&').toLowerCase();
};

ohq.humanizeTime = function(unixTime) {
  var diff = ((new Date()).getTime() - unixTime) / (1000 * 60);
  return (diff < 1 ? '&lt;1' : Math.floor(diff)) + 
      ' <abbr title="minute">min.</abbr>';
}

/**
 * Kick off
 * @param {Object} [qData] Some data to get started on.
 */
ohq.init = function(qData) {

  ohq.queue = new ohq.Queue();
  ohq.App = new ohq.AppView({ collection: ohq.queue });

  var testData = {
    queue: [
      ohq.newQItem('Foo', 1341986277070, true),
      ohq.newQItem('Bar', 1341986639643, false),
      ohq.newQItem('Baz', 1341986652980, false),
      ohq.newQItem('Bux', 1341986279661, true),
    ],
    ta_present: true
  };

  // for (var i = 0; i < testData.queue.length; i++) {
  //   ohq.queue.create({ name: testData.queue[i]['name'] })
  // }

  // Initiate socket connection
  // ohq.socket = io.connect(ohq.SOCKET_SERVER);
  // ohq.templates = {
  //   queue: ohq.getTpl('queue'),
  //   queue_item: ohq.getTpl('queue_item')

  return true;
};

ohq.newQItem = function(name, time, canEdit) {
  return {
    name: name,
    enqueue_time: time,
    human_enqueue_time: (new Date(time)).toString(),
    can_edit: canEdit
  };
};