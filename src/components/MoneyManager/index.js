import {Component} from 'react'
import {DateRangePicker} from 'react-date-range'
import axios from 'axios'
import 'react-date-range/dist/styles.css' // main style file
import 'react-date-range/dist/theme/default.css' // theme css file

import TransactionItem from '../TransactionItem'
import MoneyDetails from '../MoneyDetails'
import './index.css'

const transactionTypeOptions = [
  {
    optionId: 'Income',
    displayText: 'Income',
  },
  {
    optionId: 'Expenses',
    displayText: 'Expenses',
  },
]

const transactionTypeFilterOptions = [
  {
    optionId: 'All',
    displayText: 'All',
  },
  {
    optionId: 'Income',
    displayText: 'Income',
  },
  {
    optionId: 'Expenses',
    displayText: 'Expenses',
  },
]

class MoneyManager extends Component {
  constructor(props) {
    super(props)
    this.fetchTransactions()
  }

  state = {
    transactionsList: [],
    titleInput: '',
    amountInput: '',
    dateInput: '',
    optionId: transactionTypeOptions[0].optionId,
    typeFilter: transactionTypeFilterOptions[0].optionId,
    selectionRange: {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  }

  fetchTransactions = async () => {
    const {selectionRange, typeFilter} = this.state
    const fromDate = new Date(selectionRange.startDate)
      .toISOString()
      .slice(0, 10)
    const toDate = new Date(selectionRange.endDate).toISOString().slice(0, 10)
    let query = `fromDate=${fromDate}&toDate=${toDate}`
    if (typeFilter && typeFilter !== 'All') {
      query = `${query}&type=${typeFilter}`
    }
    axios
      .get(
        `https://money-manager-backend-g5hg.onrender.com/api/manager/?${query}`,
      )
      .then(response => {
        const fetchedData = response.data
        const updatedData = fetchedData.map(eachData => ({
          id: eachData.id,
          title: eachData.title,
          amount: eachData.amount,
          type: eachData.type,
          date: eachData.date,
        }))
        this.setState({transactionsList: updatedData})
      })
  }

  postTransaction = payload => {
    axios
      .post(
        'https://money-manager-backend-g5hg.onrender.com/api/manager/',
        payload,
      )
      .then(() => {
        this.fetchTransactions()
      })
  }

  deleteTransaction = id => {
    axios
      .delete(
        `https://money-manager-backend-g5hg.onrender.com/api/manager/${id}`,
      )
      .then(() => {
        this.fetchTransactions()
      })
  }

  onAddTransaction = event => {
    event.preventDefault()
    const {titleInput, amountInput, dateInput, optionId} = this.state
    if (titleInput === '' || amountInput === '' || dateInput === '') {
      // eslint-disable-next-line no-alert
      alert('Please fill all the fields')
      return
    }
    const typeOption = transactionTypeOptions.find(
      eachTransaction => eachTransaction.optionId === optionId,
    )
    const {displayText} = typeOption
    const payload = {
      title: titleInput,
      amount: parseInt(amountInput),
      type: displayText,
      date: dateInput,
    }
    this.postTransaction(payload)

    this.setState(prevState => ({
      transactionsList: [...prevState.transactionsList],
      titleInput: '',
      amountInput: '',
      dateInput: '',
      optionId: transactionTypeOptions[0].optionId,
    }))
  }

  onChangeOptionId = event => {
    this.setState({optionId: event.target.value})
  }

  onChangeAmountInput = event => {
    this.setState({amountInput: event.target.value})
  }

  onChangeDateInput = event => {
    this.setState({dateInput: event.target.value})
  }

  onChangeTitleInput = event => {
    this.setState({titleInput: event.target.value})
  }

  onChangeTypeFilterInput = event => {
    this.setState({typeFilter: event.target.value})
    setTimeout(() => {
      this.fetchTransactions()
    }, 100)
  }

  handleSelect = range => {
    this.setState({selectionRange: range.selection})
    setTimeout(() => {
      this.fetchTransactions()
    }, 100)
  }

  getExpenses = () => {
    const {transactionsList} = this.state
    let expensesAmount = 0

    transactionsList.forEach(eachTransaction => {
      if (eachTransaction.type === transactionTypeOptions[1].displayText) {
        expensesAmount += eachTransaction.amount
      }
    })

    return expensesAmount
  }

  getIncome = () => {
    const {transactionsList} = this.state
    let incomeAmount = 0
    transactionsList.forEach(eachTransaction => {
      if (eachTransaction.type === transactionTypeOptions[0].displayText) {
        incomeAmount += eachTransaction.amount
      }
    })

    return incomeAmount
  }

  getBalance = () => {
    const {transactionsList} = this.state
    let balanceAmount = 0
    let incomeAmount = 0
    let expensesAmount = 0

    transactionsList.forEach(eachTransaction => {
      if (eachTransaction.type === transactionTypeOptions[0].displayText) {
        incomeAmount += eachTransaction.amount
      } else {
        expensesAmount += eachTransaction.amount
      }
    })

    balanceAmount = incomeAmount - expensesAmount

    return balanceAmount
  }

  render() {
    const {
      titleInput,
      amountInput,
      dateInput,
      optionId,
      transactionsList,
      typeFilter,
      selectionRange,
    } = this.state
    const balanceAmount = this.getBalance()
    const incomeAmount = this.getIncome()
    const expensesAmount = this.getExpenses()

    return (
      <div className="app-container">
        <div className="responsive-container">
          <div className="header-container">
            <h1 className="heading">Hi,</h1>
            <p className="header-content">
              Welcome to
              <span className="money-manager-text"> Money Manager</span>
            </p>
          </div>
          <MoneyDetails
            balanceAmount={balanceAmount}
            incomeAmount={incomeAmount}
            expensesAmount={expensesAmount}
          />
          <div className="transaction-details">
            <form className="transaction-form" onSubmit={this.onAddTransaction}>
              <h1 className="transaction-header">Add Transaction</h1>
              <label className="input-label" htmlFor="title">
                Transaction Detail
              </label>
              <input
                type="text"
                id="title"
                value={titleInput}
                onChange={this.onChangeTitleInput}
                className="input"
                placeholder="Enter your description..."
              />
              <label className="input-label" htmlFor="amount">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                className="input"
                value={amountInput}
                onChange={this.onChangeAmountInput}
                placeholder="Enter your amount..."
              />
              <label className="input-label" htmlFor="date">
                Transaction Date
              </label>
              <input
                type="date"
                id="date"
                className="input"
                value={dateInput}
                onChange={this.onChangeDateInput}
                placeholder="Enter your amount..."
              />
              <label className="input-label" htmlFor="select">
                Transaction Type
              </label>
              <select
                id="select"
                className="input"
                value={optionId}
                onChange={this.onChangeOptionId}
              >
                {transactionTypeOptions.map(eachOption => (
                  <option key={eachOption.optionId} value={eachOption.optionId}>
                    {eachOption.displayText}
                  </option>
                ))}
              </select>
              <button type="submit" className="button">
                Submit
              </button>
            </form>
            <div className="history-transactions">
              <h1 className="transaction-header">History</h1>
              <DateRangePicker
                ranges={[selectionRange]}
                onChange={this.handleSelect}
              />
              <label className="input-label" htmlFor="select-filter-type">
                Transaction Type
              </label>
              <select
                id="select-filter-type"
                className="input"
                value={typeFilter}
                onChange={this.onChangeTypeFilterInput}
              >
                {transactionTypeFilterOptions.map(eachOption => (
                  <option key={eachOption.optionId} value={eachOption.optionId}>
                    {eachOption.displayText}
                  </option>
                ))}
              </select>
              <div className="transactions-table-container">
                <ul className="transactions-table">
                  <li className="table-header">
                    <p className="table-header-cell">Date</p>
                    <p className="table-header-cell">Title</p>
                    <p className="table-header-cell">Type</p>
                    <p className="table-header-cell">Amount</p>
                  </li>
                  {transactionsList.map(eachTransaction => (
                    <TransactionItem
                      key={eachTransaction.id}
                      transactionDetails={eachTransaction}
                      deleteTransaction={this.deleteTransaction}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MoneyManager
