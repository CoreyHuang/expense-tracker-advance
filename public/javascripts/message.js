const alert = document.querySelector('.alert')
const useOpacity = document.querySelector('.useOpacity')


if (alert && useOpacity) {
  setTimeout(() => {
    useOpacity.classList.add('alertMessage')
    useOpacity.addEventListener('animationend', event => {
      event.target.classList.remove('alertMessage')
      useOpacity.remove()
    }, { once: true })
  }, 1000)
}

