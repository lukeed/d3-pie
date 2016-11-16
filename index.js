
import d3 from 'd3'

/**
 * Default config.
 */

const defaults = {
  // target element or selector to contain the svg
  target: '#chart',

  // width of chart
  width: 500,

  // height of chart
  height: 250,

  // transition easing function
  ease: 'linear',

  // transition duration
  duration: 600,

  // donut thickness
  thickness: 50,

  // label accessor function
  label: d => d.data.label,

  // color range
  color: ['RGB(0, 177, 240)', 'rgb(243, 43, 101)'],

  // color interpolation
  colorInterpolate: d3.interpolateHsl
}

/**
 * Mid angle.
 */

const midAngle = d => d.startAngle + (d.endAngle - d.startAngle) / 2

/**
 * PieChart.
 */

export default class PieChart {

  /**
   * Construct with the given `config`.
   */

  constructor(config) {
    this.set(config)
    this.init()
  }

  /**
   * Set configuration options.
   */

  set(config) {
    Object.assign(this, defaults, config)
  }

  /**
   * Initialize the chart.
   */

  init() {
    const { target, width, height, thickness } = this
    const { color, colorInterpolate } = this

    this.radius = Math.min(width, height) / 2

    this.chart = d3.select(target)
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)

    this.chart.append('g')
      .attr('class', 'slices')

    this.chart.append('g')
      .attr('class', 'labels')

    this.chart.append('g')
      .attr('class', 'lines')

    this.pie = d3.layout.pie()
        .value(d => d.value)

    this.innerArc = d3.svg.arc()
        .outerRadius((this.radius - thickness) * 0.7)
        .innerRadius(this.radius * 0.7)

    this.outerArc = d3.svg.arc()
        .innerRadius(this.radius * 0.8)
        .outerRadius(this.radius * 0.8)

    this.color = d3.scale.linear()
        .interpolate(colorInterpolate)
        .range(color)
  }

  /**
   * Render slices.
   */

  renderSlices(data) {
    const { chart, color, pie, innerArc, outerArc, duration, ease } = this

    color.domain([0, data.length])

    const slice = chart.select('.slices')
        .selectAll('path.slice')
        .data(pie(data), d => d.data.label)

    slice.enter().insert('path')
        .attr('class', 'slice')
        .style('fill', (d, i) => color(i))

    slice.transition()
        .duration(duration)
        .ease(ease)
        .attrTween('d', d => {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0);
          return t => innerArc(interpolate(t))
        })

    slice.exit().remove()
  }

  /**
   * Render slice labels.
   */

  renderLabels(data) {
    const { chart, pie, outerArc, radius, label, duration, ease } = this

    const text = chart.select('.labels')
        .selectAll('text')
          .data(pie(data), d => d.data.label)

    text.enter().append('text')
        .attr('dy', '.35em')
        .text(label)

    text.transition()
        .duration(duration)
        .ease(ease)
        .attrTween('transform', d => {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return t => {
            const d2 = interpolate(t)
            var pos = outerArc.centroid(d2)
            pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1)
            return `translate(${pos})`
          }
        })
        .styleTween('text-anchor', d => {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return t => {
            const d2 = interpolate(t)
            return midAngle(d2) < Math.PI ? 'start' : 'end'
          }
        })

    text.exit().remove()
  }

  /**
   * Render label lines.
   */

  renderLines(data) {
    const { chart, pie, innerArc, outerArc, radius, duration, ease } = this

    const polyline = chart.select('.lines')
        .selectAll('polyline')
        .data(pie(data), d => d.data.label)

    polyline.enter().append('polyline')

    polyline.transition()
        .duration(duration)
        .ease(ease)
        .attrTween('points', d => {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return t => {
            const d2 = interpolate(t)
            var pos = outerArc.centroid(d2)
            pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1)
            return [innerArc.centroid(d2), outerArc.centroid(d2), pos]
          };
        });

    polyline.exit().remove()
  }

  /**
   * Render the chart against the given `data` which takes
   * an array of objects with a `.label` and numeric `.value`.
   */

  render(data) {
    this.renderSlices(data)
    this.renderLabels(data)
    this.renderLines(data)
  }

  /**
   * Update the chart against the given `data`.
   */

  update(data) {
    this.render(data)
  }
}
