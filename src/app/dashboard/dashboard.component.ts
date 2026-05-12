import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  pacientes: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    this.http.get<any[]>('http://127.0.0.1:8000/api/dashboard/')
      .subscribe({
        next: (data) => {
          console.log(data);
          this.pacientes = data;
         setTimeout(() => {

  this.pacientes.forEach((paciente, index) => {

    const labels = paciente.evaluaciones.map(
      (e: any) => 'Sesión ' + e.sesion_actual
    );

    const hombroData = paciente.evaluaciones.map(
      (e: any) => e.rom.hombro
    );

    new Chart(`chart${index}`, {

      type: 'line',

      data: {
        labels: labels,

        datasets: [
          {
            label: 'ROM Hombro',
            data: hombroData,
            borderWidth: 3,
            tension: 0.3
          }
        ]
      },

      options: {
        responsive: true
      }

    });

  });

}, 100); 
        },
        error: (err) => {
          console.error(err);
        }
      });

  }

}