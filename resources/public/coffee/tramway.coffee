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
  initialize: (date, traffic) ->
    @set {date: date, traffic: traffic, guests: new GuestsCollection}

class Days extends Backbone.Collection
  model: Day

class Exhibition extends Backbone.Model
  url: ->
    "/" + @id + ".json"

  fetch: ->
    d3.json(@url(),
      (d) =>
        days = new Days
        days.add [ new Day(x.date, x.traffic) for x in d.data ]
        @set {days: days, title: d.event}
    )


class Tramway extends Backbone.View
  id: 'content'

  tagName: 'div'

  initialize: ->
    @width = innerWidth - 20
    @height = innerHeight - 20
    @svg = d3.select(@id).append("svg")
      .attr("width", @width)
      .attr("height", @height)
      .append("g")
      .attr("transform", "translate(20, 20)")

  render: =>
    @svg.selectAll("text.title")
      .data(@model, (d) -> d.id)
      .enter()
      .attr("class", "title")
      .attr("dy", ".71em")
      .text(@model.get('event'))

  xscale: d3.scale.linear().domain([0, 1]).range([0, @width])
  yscale: d3.scale.linear().domain([0, 1]).range([0, @height])

window.ex = new Exhibition({id: "eladlassry"})
