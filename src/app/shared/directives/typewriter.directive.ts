import { Directive, ElementRef, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTypewriter]',
  standalone: true
})
export class TypewriterDirective implements OnInit, OnDestroy, OnChanges {
  @Input() appTypewriter: string = '';
  @Input() typewriterSpeed: number = 50; // Velocidade em ms por caractere
  @Input() typewriterDelay: number = 500; // Delay antes de começar
  @Input() showCursor: boolean = true;
  @Input() cursorChar: string = '|';

  private timeoutId?: number;
  private currentText: string = '';
  private currentIndex: number = 0;
  private isTyping: boolean = false;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (this.appTypewriter && isPlatformBrowser(this.platformId)) {
      this.startTyping();
    } else if (this.appTypewriter) {
      // No server-side, apenas mostra o texto completo
      this.el.nativeElement.textContent = this.appTypewriter;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appTypewriter'] && !changes['appTypewriter'].firstChange) {
      if (isPlatformBrowser(this.platformId)) {
        this.restart();
      } else {
        this.el.nativeElement.textContent = this.appTypewriter;
      }
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private startTyping() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.currentText = '';
    this.currentIndex = 0;
    this.isTyping = true;
    
    // Delay inicial antes de começar a digitar
    setTimeout(() => {
      this.typeNextChar();
    }, this.typewriterDelay);
  }

  private typeNextChar() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.currentIndex < this.appTypewriter.length) {
      this.currentText += this.appTypewriter[this.currentIndex];
      this.updateDisplay();
      this.currentIndex++;
      
      this.timeoutId = window.setTimeout(() => {
        this.typeNextChar();
      }, this.typewriterSpeed);
    } else {
      this.isTyping = false;
    }
  }

  private updateDisplay() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const displayText = this.currentText + (this.showCursor && this.isTyping ? this.cursorChar : '');
    this.el.nativeElement.textContent = displayText;
  }

  // Método público para reiniciar a animação
  restart() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.startTyping();
  }

  // Método público para parar a animação
  stop() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.isTyping = false;
    this.currentText = this.appTypewriter;
    this.updateDisplay();
  }
}
