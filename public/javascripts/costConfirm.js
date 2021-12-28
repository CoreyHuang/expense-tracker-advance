


export default (function () {

  const costConfirm = document.querySelector('#costConfirm')
  const costReturn = document.querySelector('#costReturn')

  if (costConfirm)
  costConfirm.addEventListener('click', clickCostConfirm)

  if (costReturn)
  costReturn.addEventListener('click', clickCostReturn)


  function clickCostConfirm (e) {
      const csrf = e.target.dataset.csrf
      const paymentId = e.target.dataset.payment
      //console.log('click addEventListener')
      axios.post(`./unconfirmed`, { paymentId, csrf })
        .then(data => {
          const { status, result } = data.data
          if (status === '200' & result === 'success') {
            costConfirm.removeEventListener('click', clickCostConfirm)
            costReturn.removeEventListener('click', clickCostReturn)
            costReturn.setAttribute('disabled', '')
          }
          else console.log('save error')
        })
        .catch(err => console.log(err))
  }

  function clickCostReturn (e) {
    const csrf = e.target.dataset.csrf
    const paymentId = e.target.dataset.payment
    console.log('click addEventListener')
    axios.post(`./returned`, { paymentId, csrf })
      .then(data => {
        const { status, result } = data.data
        if (status === '200' & result === 'success') {
          costConfirm.removeEventListener('click', clickCostConfirm)
          costReturn.removeEventListener('click', clickCostReturn)
          costConfirm.setAttribute('disabled', '')
        }
        else console.log('save error')
      })
      .catch(err => console.log(err))
  }

})()