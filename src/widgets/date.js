/**
 * @file Date input widget
 */

"use strict";

import { Widget } from "./core";

/**
 * DateInput - Input for date
 * @class
 */
export class DateInput extends Widget {
    /**
     * Render the date input field
     * @returns {HTMLElement} render the input widget
     */
    renderField() {
        let dateInput = document.createElement("input");
        dateInput.setAttribute("name", this.name);
        dateInput.setAttribute("type", "date");
        dateInput.setAttribute("value", this.value ? this.value : "");
        dateInput.setAttribute("class", this.getFieldClass());

        if (this.options.hasOwnProperty("min")) {
            if (this.options.min === "now") {
                var today = new Date();
                dateInput.setAttribute(
                    "min",
                    today.toISOString().slice(0, -14)
                );
            } else {
                dateInput.setAttribute("min", this.options.min);
            }
        }

        for (let attrib in this.attribs) {
            dateInput.setAttribute(attrib, this.attribs[attrib]);
        }

        return dateInput;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-date";
    }
}

/**
 * DateSelectionInput - Selection Input for date
 * @class
 */
export class DateSelectionInput extends Widget {
    /**
     * @constructor
     */
    constructor(
        field,
        type,
        id,
        name,
        label,
        attribs = {},
        options = {},
        initial = null
    ) {
        // Don't set the initial value by default, we overide the
        // method to set it as a date object
        super(field, type, id, name, label, attribs, options, null);
        this.setDateValue(initial);
    }

    /**
     * Render the date input field
     * @returns {HTMLElement} render the input widget
     */
    renderField() {
        let dateWrapper = document.createElement("div");
        dateWrapper.setAttribute("class", "mutt-date-selector");

        let currentValue = this.getDateValue();

        // Value store
        let dateInput = document.createElement("input");
        dateInput.setAttribute("name", this.name);
        dateInput.setAttribute("type", "hidden");
        dateInput.setAttribute("value", this.value ? this.value : "");
        dateWrapper.appendChild(dateInput);

        // Pickers
        let dayInput = document.createElement("select");
        dayInput.setAttribute("name", `${this.name}-day`);

        for (let index of Array.from(Array(31).keys())) {
            let day = index + 1;
            let dayNumberOption = document.createElement("option");
            dayNumberOption.setAttribute("value", ("0" + day).slice(-2));

            dayNumberOption.textContent = day;

            if (currentValue !== null && currentValue.getDate() === day) {
                dayNumberOption.selected = "selected";
            }

            dayInput.appendChild(dayNumberOption);
        }

        dateWrapper.appendChild(dayInput);

        let monthInput = document.createElement("select");
        monthInput.setAttribute("name", `${this.name}-month`);

        let months = this.getMonthNames();
        for (let monthIndex in months) {
            let month = months[monthIndex];
            let monthNameOption = document.createElement("option");

            // Get the month number
            let monthNumber = parseInt(monthIndex) + 1;

            // Zero pad the number (Safari/iOS need the zero to
            // parse the date)
            monthNumber = ("0" + monthNumber).slice(-2);

            monthNameOption.setAttribute("value", monthNumber);
            monthNameOption.textContent = month;

            if (
                currentValue !== null &&
                currentValue.getMonth() === parseInt(monthIndex)
            ) {
                monthNameOption.selected = "selected";
            }

            monthInput.appendChild(monthNameOption);
        }

        dateWrapper.appendChild(monthInput);

        let yearInput = document.createElement("select");
        yearInput.setAttribute("name", `${this.name}-year`);

        let currentYear = new Date().getFullYear();
        let thisYear = currentYear;
        let maxYears = 20;

        if (this.options.hasOwnProperty("years")) {
            maxYears = this.options.years;
        }

        while (thisYear > currentYear - maxYears) {
            let yearOption = document.createElement("option");
            yearOption.setAttribute("value", thisYear);
            yearOption.textContent = thisYear;

            if (
                currentValue !== null &&
                currentValue.getFullYear() === thisYear
            ) {
                yearOption.selected = "selected";
            }

            yearInput.appendChild(yearOption);
            thisYear--;
        }

        dateWrapper.appendChild(yearInput);

        return dateWrapper;
    }

    /**
     * Get the class name for the widget element
     */
    getFieldClass() {
        return "mutt-field mutt-field-date-selector";
    }

    /**
     *
     */
    getElementDay() {
        return this.getElementWrapper().querySelector(
            `[name="${this.name}-day"]`
        );
    }

    /**
     *
     */
    getElementMonth() {
        return this.getElementWrapper().querySelector(
            `[name="${this.name}-month"]`
        );
    }

    /**
     *
     */
    getElementYear() {
        return this.getElementWrapper().querySelector(
            `[name="${this.name}-year"]`
        );
    }

    /**
     *
     */
    getMonthNames() {
        return [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];
    }

    /**
     * Get the value of an element on the stage. This is the raw value
     * as specified in the HTML.
     * @returns {string} value of the element on the stage
     */
    getDateValue() {
        if (!this._rendered) {
            return this.value;
        }

        let elementDay = this.getElementDay();
        let elementMonth = this.getElementMonth();
        let elementYear = this.getElementYear();

        if (!elementDay || !elementMonth || !elementYear) {
            throw new Error("Unable to get element for date!");
        }

        let value = `${elementYear.value}-${elementMonth.value}-${
            elementDay.value
        }`;

        // Attempt to validate the bloody thing
        let timestamp = Date.parse(value);

        if (isNaN(timestamp)) {
            this.value = null;
            return this.value;
        }

        let dateValue = new Date(timestamp);
        this.value = dateValue;

        return this.value;
    }

    /**
     * Set the value of an element on the stage.
     * @param {string} value - value to set the HTML element too
     */
    setDateValue(value) {
        // If its a string, try to parse
        if (typeof value === "string") {
            let timestamp = Date.parse(value);

            if (isNaN(timestamp)) {
                // Don't set invalid dates
                return;
            }

            value = new Date(timestamp);
        }

        this.value = value;

        if (!this._rendered) {
            return;
        }

        let elementDay = this.getElementDay();
        let elementMonth = this.getElementMonth();
        let elementYear = this.getElementYear();

        let date = value.getDate();
        if (date.toString().length === 1) {
            date = `0${date}`;
        }

        let month = value.getMonth() + 1;
        if (month.toString().length === 1) {
            month = `0${month}`;
        }

        if (elementDay && elementMonth && elementYear) {
            elementDay.value = date;
            elementMonth.value = month;
            elementYear.value = this.value.getFullYear();
        }
    }

    /**
     * Get the value of an element on the stage. This is the raw value
     * as specified in the HTML.
     * @returns {string} value of the element on the stage
     */
    getValue() {
        return this.getDateValue();
    }

    /**
     * Set the value of an element on the stage.
     * @param {string} value - value to set the HTML element too
     */
    setValue(value) {
        this.setDateValue(value);
    }
}
