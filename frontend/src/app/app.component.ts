import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

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
  uploadImg:any;

  constructor(private http: HttpClient, private fb: FormBuilder, private sanitizer: DomSanitizer){}

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

    this.image = await this.http.get<any>('/blob/' + key.value, {responseType: "blob" as "json"}).toPromise()
    let objectURL = URL.createObjectURL(this.image);       
    this.uploadImg = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    
    if (this.image == null){
      window.alert('Null returned')
    }
    else {
      this.fileInfo = this.result
      console.info(this.result)
    }



  }

  async retrieveSQLImage(key){

    this.image = await this.http.get<any>('/sqlblob/' + key.value, {responseType: "blob" as "json"}).toPromise()
    console.info('after receive image...', this.image)

    let objectURL = URL.createObjectURL(this.image);       
    this.uploadImg = this.sanitizer.bypassSecurityTrustUrl(objectURL);

    if (this.image == null){
      window.alert('Null returned')
    }
    else {
  //    console.info(this.result)
    }

  }

}


