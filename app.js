//BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage; /**This is the percentage for each expense */
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1 /**This percentage is the overall expenses percentage */,
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });

    data.totals[type] = sum;
  };

  return {
    addItem: function (type, des, val) {
      var previousID, ID, newItem;
      /**The current ID would be the previous ID+1
       * eg. exp: [1,2,3], next ID = 3+1 = 4
       */

      if (data.allItems[type].length > 0) {
        previousID = data.allItems[type][data.allItems[type].length - 1].id;
        ID = previousID + 1;
      } else {
        ID = 0;
      }

      if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else if (type === "exp") {
        newItem = new Expense(ID, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      //To delete from an array we need the index of what we want to delete
      ids = data.allItems[type].map(function (cur) {
        return cur.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      //calculate the total income and expense
      calculateTotal("inc");
      calculateTotal("exp");

      //calculate the Budget: Income - Expense
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the expense percentage
      if (data.totals.inc > data.totals.exp) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calculatePercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc; /**This returns an array of each expense percentage */
    },

    getBudget: function () {
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalExpense: data.totals.exp,
        totalIncome: data.totals.inc,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

//UI CONTROLLER
var UIController = (function () {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  /**The code below is used to display a decimal number and indicate a comma at every thousand */
  var formatNumber = function (num, type) {
    num = num.toFixed(2); /**Code to indicate a decimal */
    var numSplit = num.split(".");
    var int = numSplit[0];
    var dec = numSplit[1];
    if (int.length > 3) {
      /** e.g 11255 === 11,255*/
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
      /**The substring is a method that accepts two values; the fist value is where you want the new string to begin from and second is where you want it to end*/
    }
    type === "exp" ? (sign = "-") : (sign = "+");
    return sign + " " + int + "." + dec;
  };

  /**Hack for looping through nodeList */
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInputValue: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    getDOMStrings: function () {
      return DOMStrings;
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields); //converting fields which is a nodeList to an array
      fieldsArr.forEach(function (cur) {
        cur.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalIncome,
        "inc"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExpense, "exp");
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage;
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(
        DOMStrings.expensesPercentageLabel
      );
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayDate: function () {
      var now, month, months, year;
      now = new Date();
      month = now.getMonth();
      months = [
        "January",
        "Febuary",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + "," + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function () {
    //1. calculate the budget
    budgetCtrl.calculateBudget();

    //2. Return the budget
    var budget = budgetCtrl.getBudget();

    //3. Display Budget in the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    //1. Calculate percentages
    budgetCtrl.calculatePercentages();
    //2. Read Percentages from the Budget controller
    var percentages = budgetCtrl.getPercentages(); /**This percentages variable is an array of all percentages */
    //3. Update the percentages on the UI
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    //1. Get input values;
    var input = UICtrl.getInputValue();

    var type = input.type;
    var description = input.description;
    var value = input.value;
    if (description !== "" && !isNaN(value) && value > 0) {
      //2.Add the item to the Budget controller
      newItem = budgetCtrl.addItem(type, description, value);

      //3. Add the item to the UI
      UICtrl.addListItem(newItem, type);

      //4. Clear the input fields
      UICtrl.clearFields();

      //5. Calculate and update Budget
      updateBudget();

      //6. Calculate and update the percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete item fom data structure
      budgetCtrl.deleteItem(type, ID);
      // 2.Delete item from UI
      UICtrl.deleteListItem(itemID);

      //3. Update new Budget
      updateBudget();

      //4. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started");
      UICtrl.displayBudget({
        budget: 0,
        percentage: 0,
        totalExpense: 0,
        totalIncome: 0,
      });
      UICtrl.displayDate();
      setupEventListeners();
    },
  };
})(budgetController, UIController);

controller.init();
