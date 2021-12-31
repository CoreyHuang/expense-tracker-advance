


export default (function () {

  const confirmPage = document.querySelector('#confirmPage')
  if (confirmPage) {
    confirmPage.addEventListener('click', (e) => {
      let route = ""
      if (e.target.id === "costConfirm") {
        route = "unconfirmed"
        clickButton(e, route)
      } else if (e.target.id === "costReturn") {
        route = "returned"
        clickButton(e, route)
      }

    })
  }

  function clickButton (e, route) {
    const csrf = e.target.dataset.csrf
    const paymentId = e.target.dataset.payment
    axios.post(`./${route}`, { paymentId, csrf })
      .then(data => {
        const { status, result } = data.data
        if (status === '200' & result === 'success') {
          e.target.id = null
          e.target.dataset.payment = null
          e.target.setAttribute('disabled', '')
          const payment = document.querySelector(`[data-payment = "${paymentId}"]`)
          payment.dataset.payment = null
          payment.id = null
        }
        else console.log('save error')
      })
      .catch(err => console.log(err))
  }

})()