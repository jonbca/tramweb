# Fix up reqwest's strange ajax to work with Backbone
$.ajax.compat && $.ender({ajax: $.ajax.compat})

Backbone = require('backbone')
STEPS_PER_SLOT = 20
SLOTS_PER_DAY  = 10
STEPS_PER_DAY  = STEPS_PER_SLOT * SLOTS_PER_DAY

exprand = (lambda) -> (-1/lambda) * Math.log(Math.random())

class Guest extends Backbone.Model
  defaults:
    x: 0
    y: Math.random()

  advance: ->
    @set {x: Math.random(), y: Math.random()}

class GuestsCollection extends Backbone.Collection
  model: Guest

class Day extends Backbone.Model
  initialize: ->
    @set "guests", new GuestsCollection

class Days extends Backbone.Collection
  model: Day

class Exhibition extends Backbone.Model
  url: ->
    "/" + @id + ".json"

  parse: (result) ->
    days = new Days
    [days.add {date: d.date, traffic: d.traffic} for d in result.data]
    @set
      event: result.event
      days: days
      currentDate: result.data[0].date

class Tramway extends Backbone.View
  el: "#content"

  initialize: ->
    @width = innerWidth - 20
    @height = innerHeight - 20
    @svg = d3.select(@el).append("svg")
      .attr("width", @width)
      .attr("height", @height)
      .append("g")
      .attr("transform", "translate(20, 20)")

    @svg.append("text")
      .attr("class", "title")
      .attr("dy", ".71em")

    @svg.append("text")
      .attr("class", "date")
      .attr("transform", "translate(0, " + (@height - 40) + ")")

    @model.bind("change:event", @renderTitle)
    @model.bind("change:currentDate", @renderDate)

  renderTitle: =>
    @svg.selectAll("text.title")
      .data([@model.get("event")])
      .text(String)
    this

  renderDate: =>
    @svg.select("text.date")
      .data([@model.get("currentDate")])
      .text(String)
    this

  xscale: d3.scale.linear().domain([0, 1]).range([0, @width])
  yscale: d3.scale.linear().domain([0, 1]).range([0, @height])

this.ex = new Exhibition({id: "eladlassry"})
this.tramway = new Tramway({model: window.ex})
this.ex.fetch()
