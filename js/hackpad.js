var hackpad = {};

$(function(){
hackpad.PadModel = Backbone.Model.extend({
	localStorage : "backbone-padmodel"
});

hackpad.AppView = Backbone.View.extend({
	el : '#app-container',
	editMode : true,
	childViews : [],
	padCount : 0,
	events : {
		'click .play-mode-button' : 'togglePlay',
		'click .edit-mode-button' : 'toggleEdit',
		'click .add-trigger' : 'addTrigger'
	},
	addTrigger : function(){
			var view = new hackpad.PadView();
			this.$el.append(view.el);
			view.render();
			this.childViews.push(view);
	},
	togglePlay : function(){
		for(var x = 0; x < this.childViews.length; x++){
			this.childViews[x].togglePlay();
		}
	},
	toggleEdit : function(){
		for(var x = 0; x < this.childViews.length; x++){
			this.childViews[x].toggleEdit();
		}
	},
	initialize : function(){
		
	},
	render : function(){
		for(var x = 0; x < this.childViews.length; x++){
			this.childViews[x].remove();
		}

		for(var x = 0; x < this.padCount; x++){
			var view = new hackpad.PadView();
			this.$el.append(view.el);
			view.render();
			this.childViews.push(view);
		}

		return this;

	},
});

hackpad.PadView = Backbone.View.extend({
	
	tagName : 'div',
	className : 'pad pad-edit',
	padName : 'Default',
	events : {
		'click .trigger' : 'trigger',
		'click .play-button' : 'play',
		'click .stop-button' : 'stop',
		'click .save-button' : 'save',
		'click .test-button' : 'test',
		'click .load-button' : 'load',
		'click .pick-time' : 'pickTime'
	},
	pickTime : function(){
		var that = this;
		var iframe = this.$('iframe');
		this.widget  = SC.Widget(iframe.get(0));
		this.widget.getPosition(function(ticks){
			that.startIndex = ticks;
			that.$('.start-index').val(ticks);
		});
	},
	load : function(){
		this.embedCode = this.$('.soundcloud-url').val();

		
		this.$('.player').html(this.embedCode);
	},
	triggerOn : false,
	trigger : function(){
		if(this.triggerOn){
			this.$('.trigger').removeClass('on').addClass('off');
			this.stop();
			this.triggerOn = false;
		}else{
			this.$('.trigger').removeClass('off').addClass('on');
			this.play();
			this.triggerOn = true;
		}
	},
	test : function(){
		this.save();
		this.play();
	},
	save :function(){
		this.isLoop = this.$('.is-loop').is(':checked');
		this.startIndex = parseInt(this.$('.start-index').val());
		this.loopDuration = parseInt(this.$('.loop-duration').val());
		this.padName = this.$('.pad-name').val();
		this.$('.trigger-name').html(this.padName);
	},
	stop : function(){
		
		clearInterval(this.loopIntervalObj);
		clearTimeout(this.loopTimeoutObj);
		this.widget.pause();
	},
	play : function(){
		var that= this;
		var iframe = this.$('iframe');
		this.widget  = SC.Widget(iframe.get(0));
		this.widget.play();
		this.widget.seekTo(this.startIndex);
		this.widget.play();
		this.widget.unbind(SC.Widget.Events.PAUSE);
		
		clearInterval(this.loopIntervalObj);
		clearTimeout(this.loopTimeoutObj);
		if(this.isLoop){
			this.loopIntervalObj = setInterval(function(){
				that.widget.seekTo(that.startIndex);
				//that.widget.play();
			},this.loopDuration);
		}else{
			this.loopTimeoutObj = setTimeout(function(){
				that.widget.pause();
				this.$('.trigger').removeClass('on').addClass('off');
			},this.loopDuration)
		}
	},
	template : _.template($('#pad-view-template').html()),
	
	togglePlay : function(){
		this.$('.edit-mode').hide();
		this.$('.play-mode').show();
		this.$el.addClass('pad-play').removeClass('pad-edit');
	},
	toggleEdit : function(){
		this.$('.play-mode').hide();
		this.$('.edit-mode').show();
		this.$el.addClass('pad-edit').removeClass('pad-play');
	},
	initialize : function(){
		this.model = new hackpad.PadModel();
	},
	iframeLoaded : function(){
		console.log('iframe loaded');
	},
	render : function(){
		this.$el.html(this.template({}));
		
		var iframe = this.$('.player-iframe');
		this.$('.trigger-name').html(this.padName);
		
		
		return this;
	}
});



var app = new hackpad.AppView();
app.render();

});