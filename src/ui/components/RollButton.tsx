import styles from './RollButton.module.css'

type Props = {
  onClick: () => void
  disabled?: boolean
  label?: string
}

export function RollButton({ onClick, disabled = false, label = 'Roll' }: Props) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}
