// This view renders a Conversation or Task as a thread
(function () {

  var ConversationList = { tagName: 'div'
               , className: 'conversations'
               , template: Teambox.modules.ViewCompiler('conversations.index')
               };

  ConversationList.events = {
    "mouseover .conversation_list": "showScroll",
    "mouseout .conversation_list": "hideScroll"
  };

  ConversationList.initialize = function (options) {
    _.bindAll(this, "render");
    this.collection.bind('add', this.addConversation);
    this.collection.bind('remove', this.removeConversation);
    this.collection.bind('refresh', this.reload);
    
    // Get real complete name of project
    var project = Teambox.collections.projects.detect(function(model) {
      return model.get('permalink') === options.project_id;
    });
    
    // TODO: use I18n (translations.conversations.index.title)
    this.title = 'Conversations in ' + project.get('name');
    this.project_id = options.project_id;
    this.conversation = options.conversation;
    this.showing_scrollbar = false;
  };

  ConversationList.addConversation = function(conversation, collection) {
    this.conversationList.insert({top: new Teambox.Views.Conversation({model:thread, root_view: this}).render().el});
  };

  ConversationList.removeConversation = function(conversation, collection) {
    this.conversationList.find('.conversation[data-class=conversation, data-id='+conversation.id+', data-project-id='+conversation.get('project_id')+']').remove();
  };

  ConversationList.setActive = function(model) {
    this.current_conversation = model;
    this.trigger('change_selection', model);
  };

  ConversationList.reload = function(collection, project_id) {
    var self = this;
    // Only add them to the DOM if their project_id matches and have permisions
    collection.each(function(conversation){

      var project_matches = conversation.get('project').permalink === project_id;

      if(project_matches){
        var view = new Teambox.Views.ConversationListItem({model:conversation, root_view: self});
        self.conversation_list.insert({bottom: view.render().el});
      }
    });
  };

  ConversationList.render = function () {
    var Views = Teambox.Views, self = this;
    this.el.update(this.template({project_id: this.project_id}));
    this.conversation_list = this.el.down('.conversation_list');
    this.conversation_view = this.el.down('.conversation_view');

    this.reload(this.collection, this.project_id);
    if (this.conversation) {
      var view;
      if (this.conversation.id == null) {
        view = new Teambox.Views.ConversationNew({model: this.conversation});
      } else {
        view = new Teambox.Views.Conversation({model: this.conversation});
      }
      this.conversation_view.update(view.render().el);
    }
    return this;
  };
  
  // When mouse over conversations list, show the scrollbar
  ConversationList.showScroll = function() {
    if(this.showing_scrollbar) return;
    this.showing_scrollbar = true;
    this.el.down('.conversation_list').setStyle({
      "overflow-y": 'auto'
    });
  };
  
  // When mouse out conversations list, hide the scrollbar
  ConversationList.hideScroll = function() {
    if(!this.showing_scrollbar) return;
    this.showing_scrollbar = false;
    this.el.down('.conversation_list').setStyle({
      "overflow-y": 'hidden'
    });
  };

  // exports
  Teambox.Views.ConversationList = Backbone.View.extend(ConversationList);
}());