# Fix up reqwest's strange ajax to work with Backbone
$.ajax.compat && $.ender({ajax: $.ajax.compat})

Backbone = require('backbone')
AVERAGE_LIFE = 20 #ticks
TICK_INTERVAL = 6000 #milliseconds
RENDER_INTERVAL = 1000 #milliseconds

class Guest extends Backbone.Model
  initialize: ->
    @set "y", Math.random()
    @death = Math.floor(Math.log(Math.random())/Math.log(1 - 1/AVERAGE_LIFE)) + 1

  defaults:
    x: 0
    y: 0
    age: 0

  tick: ->
    @set
      x: Math.random()
      y: Math.random()
      age: @get("age") + 1

class GuestList extends Backbone.Collection
  model: Guest

  removeExpired: ->
    len = @length
    @remove (@filter (g) -> g.get("age") >= g.death)

  addNew: ->
    @unshift {}

class Day extends Backbone.Model

class Days extends Backbone.Collection
  model: Day

class Exhibition extends Backbone.Model
  guestList: new GuestList

  initialize: ->
    @bind("change:currentDay", -> @guestList.reset())

  url: ->
    "/" + @id + ".json"

  parse: (result) ->
    days = new Days({date: d.date, traffic: d.traffic} for d in result.data)
    @set
      currentDay: days.first()
      days: days
      event: result.event

  currentRate: ->
    @get("currentDay").get("traffic")[0]

  currentInterval: ->
    9 - @get("currentDay").get("traffic").length

  nextNewGuest: ->
    if @currentRate() > 0
      (-1 / @currentRate()) * Math.log(Math.random())
    else
      -1

  addGuest: ->
    @guestList.addNew()

  advance: ->
    if @currentInterval() == 8
      @get("days").shift()
      @set "currentDay", @get("days").first()
    else
      @get("currentDay").get("traffic").shift()

    if @currentInterval() == 8 then 3 else 1 # The actual length of a time interval is not const

class Tramway extends Backbone.View
  el: "#content"

  timescale: d3.scale.linear().domain([0, 1]).range([0, TICK_INTERVAL])

  initialize: ->
    @width = innerWidth - 20
    @height = innerHeight - 20

    @xscale = d3.scale.linear().domain([0, 1]).range([0, @width])
    @yscale = d3.scale.linear().domain([0, 1]).range([0, @height])

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

    @model.bind("change", =>
      @renderTitle()
      @renderDate()
      if not @renderInterval?
        @renderInterval = setInterval(@render, RENDER_INTERVAL)
        @addNew()
        @tick()
    )

  renderTitle: =>
    @svg.selectAll("text.title")
      .data([@model.get("event")])
      .text(String)

  renderDate: =>
    @svg.select("text.date")
      .data([@model.get("currentDay").get("date")])
      .text(String)
    this

  render: =>
    @model.guestList.removeExpired()
    guests = @svg.selectAll("circle.man")
      .data(@model.guestList.toArray(), (g) -> g.cid)

    guests.enter()
      .append("circle")
      .attr("class", "man")
      .attr("cx", (d) => @xscale(d.get('x')))
      .attr("cy", (d) => @yscale(d.get('y')))
      .attr("r", 10)

    len = @model.guestList.length

    guests.transition()
      .duration(RENDER_INTERVAL)
      .delay((d, i) -> (i / len * RENDER_INTERVAL))
      .ease("linear")
      .attr("cx", (d) => @xscale(d.get('x')))
      .attr("cy", (d) => @yscale(d.get('y')))
      .each((d) => d.tick())

    guests.exit().transition().attr("r", 0).remove()

  addNew: =>
    nextGuestTime = @model.nextNewGuest()
    if nextGuestTime >= 0
      @model.addGuest()
      window.setTimeout(@addNew, @timescale(@model.nextNewGuest()))
    else
      @sleeping = true

  tick: =>
    intervalLength = @model.advance()

    if @sleeping
      @sleeping = false
      window.setTimeout(@addNew, @timescale(@model.nextNewGuest()))

    window.setTimeout(@tick, TICK_INTERVAL * intervalLength)

this.ex = new Exhibition({id: "eladlassry"})
this.tramway = new Tramway({model: this.ex})
this.ex.fetch()
