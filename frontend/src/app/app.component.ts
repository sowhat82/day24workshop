import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  @ViewChild('uploadForm', {static: false}) uploadForm: NgForm;
  @ViewChild('imageFile ', {static: false}) imageFile: ElementRef;
  @ViewChild('retrieveKeyForm', {static: false}) retrieveKeyForm: NgForm;
  form: FormGroup;

  latestKeyCreated: any
  fileInfo  = {}
  result: any;
  image: any;

  constructor(private http: HttpClient, private fb: FormBuilder){}

  ngOnInit(){
    this.form = this.fb.group({
      'image-file': this.fb.control('')
    })
  }

  async upload(){

    const formData = new FormData();

    formData.set('name', this.form.get('image-file').value);
    formData.set('image-file', this.imageFile.nativeElement.files[0]);
    
    this.latestKeyCreated = await this.http.post<any>('/upload', formData).toPromise()

    console.info(this.latestKeyCreated)

      console.info('/blob/' + String(this.latestKeyCreated['key']))    
      this.fileInfo = await this.http.get<any>('/blob/' + String(this.latestKeyCreated['key'])).toPromise()

    console.info(this.fileInfo)

  }

  async uploadToSQL(){

    const formData = new FormData();

    formData.set('name', this.form.get('image-file').value);
    formData.set('image-file', this.imageFile.nativeElement.files[0]);
    
    this.latestKeyCreated = await this.http.post<any>('/uploadToSQL', formData).toPromise()
  }

  async retrieveKey(key){

    this.result = await this.http.get<any>('/blob/' + key.value).toPromise()

    if (this.result == null){
      window.alert('Null returned')
    }
    else {
      this.fileInfo = this.result
    }

  }

  async retrieveSQLImage(key){

    this.image = await this.http.get<any>('/sqlblob/' + key.value, {observe: 'response', responseType: 'json'}).toPromise()
    console.info('after receive image...')

    if (this.image == null){
      window.alert('Null returned')
    }
    else {
  //    console.info(this.result)
    }

  }

}


