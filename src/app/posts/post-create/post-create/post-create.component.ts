import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { PostsService } from "../../posts.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Post } from "../../post.model";
import { mimeType } from "./mime-type.validator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"],
})
export class PostCreateComponent implements OnInit, OnDestroy {
  // 1. declare eventEmitter  then emit event with value(post)
  // 2. add post to appComponent
  //3. pass the posts to postlist post

  private mode = "create";
  private postId: string;
  public post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private authSub: Subscription;

  constructor(
    public postService: PostsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {}



  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  ngOnInit(): void {
    this.authSub= this.authService.getAuthStatusListener().subscribe(
        authStatus=>{
          this.isLoading=false;
        }
    );
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      //  has postId ----edit mode
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        // spinner
        this.isLoading = true;
        //  subscribe here therefore we can display here
        this.postService.getPost(this.postId).subscribe((postData) => {
          //  spinner
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator,
          };
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath,
          });
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  // image handler
  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onAddPost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    } else {
      this.postService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }
}
