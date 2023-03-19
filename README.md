# Hancock.js

## Purpose & Description

The purpose of this project is an exercise to become more familiar with saving data and using graphing libraries in JavaScript. It began as a discussion among friends with the question "How long would it take to hit the ground if someone jumped off the top of the Hancock building?" and has now been answered.

## Method

This project uses an iterative method to calculate net force, acceleration, velocity, and ultimately position (& height) of the faller. It iterates over all of these properties with an incremental time step (delta_t) to provide an accurate result.

## Assumptions

The project assumes that the only forces present on the faller are that of air resistance (drag) and gravity. Values for cross-sectional area and drag coefficient were estimated. The value of air density was estimated using a two-part linear piece-wise function, and are only meant to be accurate within an altitude of ~ 10,000 feet. Altitude is calculated as the faller's height plus 597 feet (which is the approximate elevation of the city of Chicago).
