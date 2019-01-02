import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { User } from '../model/user-model';
import { SignUpService } from './sign-up.service';
import { fadeIn } from '../../animations/fade-in';

@Component({
  selector: 'sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  animations: [fadeIn]
})
export class SignUpComponent implements OnInit {

  public userForm: FormGroup;
  public userInfo: User = new User();

  public formErrors = {
    'email': '',
    'password': '',
    'confirmPassword': '',
    'formError': '',
    'vcode': ''
  };
  validationMessages = {
    'email': {
      'required': '邮箱必须输入。',
      'pattern': '请输入正确的邮箱地址。'
    },
    'password': {
      'required': '密码必须输入。',
      'minlength': '密码至少要8位。'
    },
    'confirmPassword': {
      'required': '重复密码必须输入。',
      'minlength': '密码至少要8位。',
      'validateEqual': "两次输入的密码不一致。"
    }
  };

  constructor(public fb: FormBuilder,
    public signUpService: SignUpService,
    public router: Router,
    public route: ActivatedRoute,
    private messageService: MessageService) {
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm(): void {
    this.userForm = this.fb.group({
      "email": [
        this.userInfo.email,
        [
          Validators.required,
          Validators.pattern("^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$")
        ]
      ],
      "password": [
        this.userInfo.password,
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],
      "confirmPassword": [
        this.userInfo.confirmPassword,
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ]
    });
    this.userForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    const form = this.userForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  doSignUp() {
    if (this.userForm.valid) {
      this.userInfo = this.userForm.value;
      console.log(this.userInfo);
      this.signUpService.signup(this.userInfo)
        .subscribe(
          (response: any) => {
            if (response && response.success) {
              this.messageService.add({ severity: 'danger', summary: '注册成功', detail: '请登录' });
              this.router.navigateByUrl("signin");
            } else {
              this.formErrors.formError = response.msg;
            }
          },
          error => {
            this.formErrors.formError = error.message;
            console.error(error);
          }
        );
    } else {
      this.formErrors.formError = "存在不合法的输入项，请检查。";
    }
  }
}