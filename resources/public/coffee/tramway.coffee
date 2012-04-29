width = window.innerWidth - 20
height = window.innerHeight - 20

svg = d3.select("#content").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(20, 20)")

titleText = svg.append("text")
            .attr("class", "title")
            .attr("dy", ".71em")
            .text("title")

dateText = svg.append("text")
           .attr("class", "date")
           .attr("transform", "translate(0, " + (height - 30) + ")")
           .text("date")

clock = svg.append("text")
        .attr("class", "date")
        .attr("transform", "translate(400, " + (height - 30) + ")")
        .text("time")

STEPS_PER_SLOT = 20
SLOTS_PER_DAY  = 10
STEPS_PER_DAY  = STEPS_PER_SLOT * SLOTS_PER_DAY
STEPS = DAYS * STEPS_PER_DAY

xscale = d3.scale.linear().domain([0, 1]).range([0, width])
yscale = d3.scale.linear().domain([0, 1]).range([0, height])

serial = 1

exprand = (lambda) -> (-1/lambda) * Math.log(Math.random())

nextCoords = () -> {'x': xscale(Math.random()), 'y': yscale(Math.random())}

class Guest extends Backbone.Model
  initialize: () ->
    this.set("x", 0)
    this.set("y", yscale(Math.random()))

class GuestsCollection extends Backbone.Collection
  model: Guest

class Tramway
  constructor: (@exhibition) ->
    d3.json("/" + @exhibition, (@data) -> )

  advance: (dot) ->
    next = nextCoords()
    dot.x = next.x
    dot.y = next.y

  newDot: () -> { id: "_gen" + (serial++), x: 0, y: yscale(Math.random()) }
