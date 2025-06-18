import { Github, MessageCircle } from "lucide-react"
export default function WhatsAppCredit({
                                   phoneNumber = "1234567890",
                                   message = "Hola! Me interesa tu trabajo",
                               }: { phoneNumber?: string; message?: string }) {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <a
    href={whatsappUrl}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 dark:from-green-900/30 dark:to-green-800/30 dark:hover:from-green-800/40 dark:hover:to-green-700/40 text-green-700 dark:text-green-300 font-medium transition-all duration-200 hover:scale-105 hover:shadow-sm"
    target="_blank"
    rel="noopener noreferrer"
    >
    <MessageCircle className="w-4 h-4" />
        WhatsApp
        </a>
        </div>
)
}