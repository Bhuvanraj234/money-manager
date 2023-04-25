import {Component} from 'react'
import axios from 'axios'

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

const transactionHistoryOptions = [
  {
    optionId: '1',
    displayText: 'Last 1 month',
  },
  {
    optionId: '3',
    displayText: 'Last 3 months',
  },
  {
    optionId: '6',
    displayText: 'Last 6 months',
  },
  {
    optionId: '12',
    displayText: 'Last 12 months',
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
    dateFilter: transactionHistoryOptions[0].optionId,
    typeFilter: transactionTypeFilterOptions[0].optionId,
  }

  fetchTransactions = async () => {
    const {dateFilter, typeFilter} = this.state
    let query = ''
    if (dateFilter) {
      const days = {
        1: '30',
        3: '90',
        6: '180',
        12: '365',
      }
      let fromDate = new Date()
      fromDate = new Date(
        fromDate.setDate(fromDate.getDate() - days[dateFilter]),
      )
        .toISOString()
        .slice(0, 10)
      query = `fromDate=${fromDate}&toDate=${new Date()
        .toISOString()
        .slice(0, 10)}`
    }
    if (typeFilter && typeFilter !== 'All') {
      query = `${query}&type=${typeFilter}`
    }
    axios.get(`http://localhost:8080/api/manager/?${query}`).then(response => {
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
    axios.post('http://localhost:8080/api/manager/', payload).then(() => {
      this.fetchTransactions()
    })
  }

  deleteTransaction = id => {
    axios.delete(`http://localhost:8080/api/manager/${id}`).then(() => {
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

  onChangeDateFilterInput = event => {
    this.setState({dateFilter: event.target.value})
    setTimeout(() => {
      this.fetchTransactions()
    }, 100)
  }

  onChangeTypeFilterInput = event => {
    this.setState({typeFilter: event.target.value})
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
      dateFilter,
      typeFilter,
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
              <label className="input-label" htmlFor="select-filter-date">
                Transaction History
              </label>
              <select
                id="select-filter date"
                className="input"
                value={dateFilter}
                onChange={this.onChangeDateFilterInput}
              >
                {transactionHistoryOptions.map(eachOption => (
                  <option key={eachOption.optionId} value={eachOption.optionId}>
                    {eachOption.displayText}
                  </option>
                ))}
              </select>
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
